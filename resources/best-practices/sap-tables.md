# SAP ABAP & Data Dictionary Tables Cheat Sheet

## 1. ABAP & SAP Data Dictionary

### Core Data Dictionary Objects
| Table          | Description                                      |
|----------------|--------------------------------------------------|
| **DD01L**      | Domains                                          |
| **DD04L / DD04T** | Data Elements                                 |
| **DD02L / DD02T** | SAP Tables (Header + Texts)                   |
| **DD03L / DD03T** | Table Fields                                  |
| **DD07L / DD07V** | Fixed Domain Values                           |
| **DD09L**      | Technical Settings of Tables                     |
| **DD12L**      | Secondary Indexes                                |
| **DM42S**      | Table Relationships (SE11)                       |

### Repository & Development Objects
| Table             | Description                                      |
|-------------------|--------------------------------------------------|
| **TADIR**         | Directory of Repository Objects                  |
| **TRDIR**         | ABAP Programs / Report Sources                   |
| **TFDIR / TFTIT** | Function Modules + Short Texts                   |
| **ENLFDIR**       | Additional Attributes of Function Modules        |
| **TMDIR**         | Methods in Classes                               |
| **SEOCLASS**      | ABAP Objects Classes                             |
| **TDEVC / TDEVCT**| Development Classes / Packages                   |
| **D020S / D020T** | Screen Description + Texts                       |
| **D010TAB**       | Where-Used: Report → Tables                      |

### Transactions, Messages & Others
| Table       | Description                                      |
|-------------|--------------------------------------------------|
| **TSTC / TSTCT** | Transaction Codes + Texts                     |
| **TSTCP**   | Transaction Parameters                           |
| **T100**    | Messages                                         |
| **SYST**    | ABAP System Fields (Structure)                   |
| **FILEPATH / PATH** | Logical & Physical File Names                |

---

## 2. User Administration & Security

| Table          | Description                                      |
|----------------|--------------------------------------------------|
| **USR01 / USR03** | User Master + Address Data                    |
| **USR02**      | User Logon Data (incl. Lock Status)              |
| **USR21**      | User ↔ Address Key Assignment                    |
| **USR04 / UST04** | User Authorizations & Profiles                |
| **USR10**      | Authorization Profiles                           |
| **USR12**      | Authorization Values                             |
| **TOBJ**       | Authorization Objects                            |
| **USR40**      | Prohibited Passwords                             |
| **DEVACCESS**  | Developer Keys                                   |
| **USOBT**      | Transaction → Authorization Object               |

---

## 3. System Monitoring & Logs

| Table            | Description                                      |
|------------------|--------------------------------------------------|
| **SNAP**         | ABAP Runtime Errors (Short Dumps)                |
| **CDHDR / CDPOS**| Change Document Header & Items                   |
| **DBTABLOG**     | Table Change Logs                                |
| **TBTCO / TBTCP**| Background Jobs (Header + Steps)                 |
| **APQI / APQD**  | Batch Input Queue & Data                         |
| **E070 / E071**  | Transport Request Header & Tasks                 |

---

## 4. Spool, Text & Printing

| Table            | Description                                      |
|------------------|--------------------------------------------------|
| **TSP01**        | Spool Requests                                   |
| **TSP02**        | Print Requests                                   |
| **STXH / STXL**  | SAPscript Text Header & Lines                    |
| **STXFADM**      | Smart Forms Administration                       |
| **TST01 / TST03**| TemSe Objects                                    |

---

## 5. Enterprise Structure & Global Settings

### Global Settings
| Table             | Description                                      |
|-------------------|--------------------------------------------------|
| **T000 / T001**   | Clients & Company Codes                          |
| **T880**          | Global Company Data                              |
| **T005**          | Countries                                        |
| **TCURC / TCURT** | Currency Codes & Texts                           |
| **TCURR**         | Exchange Rates                                   |
| **T006**          | Units of Measure                                 |
| **TFACD**         | Factory Calendar                                 |
| **TTZZ**          | Time Zones                                       |

### Organizational Structure
| Table             | Description                                      |
|-------------------|--------------------------------------------------|
| **TKA01 / TKA02** | Controlling Areas                                |
| **T001W**         | Plants                                           |
| **T001L**         | Storage Locations                                |
| **TVKO / TVTW**   | Sales Organization & Distribution Channel        |
| **T024E**         | Purchasing Organization                          |

---

## 6. Master Data

### Material Master
| Table   | Description                    |
|---------|--------------------------------|
| **MARA** | General Material Data         |
| **MAKT** | Material Descriptions         |
| **MARC** | Plant Data                    |
| **MARD** | Storage Location Data         |
| **MVKE** | Sales Data                    |
| **MBEW** | Valuation Data                |

### Business Partner Master
| Table    | Description                          |
|----------|--------------------------------------|
| **KNA1** | Customer General Data                |
| **KNB1** | Customer Company Code Data           |
| **KNVV** | Customer Sales Area Data             |
| **LFA1** | Vendor General Data                  |
| **LFB1** | Vendor Company Code Data             |

### Classification & Address
| Table    | Description                          |
|----------|--------------------------------------|
| **CABN** | Characteristics                      |
| **KLAH** | Class Header                         |
| **ADRC** | Addresses (Business Address Service) |
| **ADRP** | Persons                              |

---

## 7. Functional Modules

### Financial Accounting (FI)
| Table    | Description                          |
|----------|--------------------------------------|
| **SKA1** | G/L Accounts (Chart of Accounts)     |
| **SKB1** | G/L Accounts (Company Code)          |
| **BKPF** | Accounting Document Header           |
| **BSEG** | Accounting Document Line Items       |
| **BSID** | Customer Open Items                  |
| **BSAD** | Customer Cleared Items               |
| **BSIK** | Vendor Open Items                    |
| **BSAK** | Vendor Cleared Items                 |

### Sales & Distribution (SD)
| Table    | Description                          |
|----------|--------------------------------------|
| **VBAK** | Sales Order Header                   |
| **VBAP** | Sales Order Item                     |
| **VBRK** | Billing Header                       |
| **VBRP** | Billing Item                         |
| **LIKP** | Delivery Header                      |
| **LIPS** | Delivery Item                        |

### Materials Management (MM)
| Table    | Description                          |
|----------|--------------------------------------|
| **EKKO** | Purchase Order Header                |
| **EKPO** | Purchase Order Item                  |
| **MKPF** | Material Document Header             |
| **MSEG** | Material Document Item               |

### Production Planning (PP)
| Table    | Description                          |
|----------|--------------------------------------|
| **AUFK** | Production Order Header              |
| **AFKO** | Production Order Header Data         |
| **RESB** | Reservations / Components            |
| **STKO** | BOM Header                           |
| **STPO** | BOM Item                             |

### Human Resources (HR)
| Table     | Description                          |
|-----------|--------------------------------------|
| **PA0001**| Organizational Assignment            |
| **PA0002**| Personal Data                        |
| **PA0008**| Basic Pay                            |
