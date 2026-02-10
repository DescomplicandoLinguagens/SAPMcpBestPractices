import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { MCPServer, text, object } from "mcp-use/server";
import { z } from "zod";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create server instance
const server = new MCPServer({
  host: "0.0.0.0",
  name: "dl_sap_mcp",
  title: "DL SAP MCP",
  version: "1.0.0",
  description: "Descomplicando Linguagens - SAP MCP",
  favicon: "logo-tab.ico",
  icons: [
    {
      src: "logo-tab.ico",
      mimeType: "image/x-icon",
      sizes: ["512x512"],
    },
  ],
});

// server.tool(
//   {
//     name: "greet",
//     description: "Greet someone by name",
//     schema: z.object({
//       name: z.string().describe("The name of the person to greet"),
//     }),
//   },
//   async ({ name }) => text(`Hello, ${name}! Welcome to MCP.`),
// );

server.tool(
  {
    name: "list_best_practices",
    description: "List all available best practice guidelines",
  },
  async () => {
    const bestPracticesDir = path.join(
      __dirname,
      "resources",
      "best-practices",
    );
    if (!fs.existsSync(bestPracticesDir)) {
      return text("No best practices directory found.");
    }
    const files = fs
      .readdirSync(bestPracticesDir)
      .filter((file) => path.extname(file) === ".md")
      .map((file) => path.basename(file, ".md"));

    return text(`Available best practices:\n- ${files.join("\n- ")}`);
  },
);

server.tool(
  {
    name: "read_best_practice",
    description: "Read a specific best practice guideline",
    schema: z.object({
      name: z
        .string()
        .describe(
          "The name of the best practice to read (e.g. 'abap-classic')",
        ),
    }),
  },
  async ({ name }) => {
    const bestPracticesDir = path.join(
      __dirname,
      "resources",
      "best-practices",
    );
    const filePath = path.join(bestPracticesDir, `${name}.md`);

    if (!fs.existsSync(filePath)) {
      return text(`Best practice '${name}' not found.`);
    }

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return text(content);
    } catch (error) {
      return text(`Error reading best practice '${name}'.`);
    }
  },
);

const bestPracticesDir = path.join(__dirname, "resources", "best-practices");

if (fs.existsSync(bestPracticesDir)) {
  const files = fs.readdirSync(bestPracticesDir);

  for (const file of files) {
    if (path.extname(file) === ".md") {
      const resourceName = path.basename(file, ".md");
      const title = resourceName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      server.resource(
        {
          uri: `file:///best-practices/${resourceName}`,
          name: title,
          description: `Guia de boas práticas: ${title}`,
          mimeType: "text/markdown",
        },
        async () => {
          const filePath = path.join(bestPracticesDir, file);
          try {
            const content = fs.readFileSync(filePath, "utf-8");
            return text(content);
          } catch (error) {
            return text(`Erro ao carregar o recurso ${title}.`);
          }
        },
      );
    }
  }
}

// Start the server
await server.listen(3000);
