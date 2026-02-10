import { MCPServer, object, text } from "mcp-use/server";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = new MCPServer({
  name: "dl_sap_mcp",
  title: "DL SAP MCP",
  version: "1.0.0",
  description: "Descomplicando Linguagens - SAP MCP",
  //baseUrl: process.env.MCP_URL || "http://localhost:3000",
  favicon: "logo-tab.ico",
  websiteUrl: "https://www.descomplicandolinguagens.com.br/",
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
//     name: "get_sap_objects",
//     description: "Busca objetos SAP",
//   },
//   async () => {
//     return object({
//       name: "SAP DLAcademy",
//       objects: [
//         { name: "YGDF1", type: "REPORT", font: "WRITE: 'Gabriel 1'." },
//         { name: "YGDF2", type: "CLASS", font: "" },
//       ],
//     });
//   },
// );

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

await server.listen(3000);
