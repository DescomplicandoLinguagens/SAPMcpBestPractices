ABAP & SAP Data Dictionary Tables
Core Data Dictionary Objects

DD01L – Domains
DD04L / DD04T – Data Elements
DD02L / DD02T / DD02V – SAP Tables (Headers + Texts)
DD03L / DD03T / DD03VT – Table Fields
DD07L / DD07V – Fixed Values for Domains
DD09L – Technical Settings of Tables
DD12L – Secondary Indices
DM42S – Table Relationships (SE11)

Repository & Development Objects

TADIR / TADIR-T – Directory of Repository Objects
TRDIR – ABAP Programs / Report Sources
TFDIR / TFTIT – Function Modules + Short Texts
ENLFDIR – Additional Attributes of Function Modules
TMDIR – Methods in Classes
SEOCLASS – ABAP Objects Classes
TDEVC / TDEVCT – Development Classes / Packages
D020S / D020T – Screen Short Description + Texts
TSE05 – ABAP Editor Insert Commands
TAPLT – Program Application Long Texts
D010TAB – Where-Used: Report → Tables

Transactions & Messages

TSTC / TSTCT – Transaction Codes + Texts
TSTCP – Transaction Parameters
T100 – Messages

Other Technical Tables

SYST – ABAP System Fields (Structure)
VBMOD – Update Function Modules (Registered)
VBDATA – Update Data
FILEPATH / PATH – Logical & Physical File Names
DDSHPVAL5 – Personal Help Values


User Administration & Security

USR01 / USR03 – User Master + Address Data
USR02 – User Logon Data (incl. Lock Status)
USR21 – User ↔ Address Key Assignment
USR04 / UST04 – User Authorizations & Profiles
USR05 – User Parameter IDs
USR10 – Authorization Profiles
USR12 – Authorization Values
UST12 – Authorizations
TOBJ / TOBC – Authorization Objects & Classes
USOBT – Transaction → Authorization Object
TSTCA – Transaction → Authorizations
USR40 – Prohibited Passwords
DEVACCESS – Developer Keys
USR41 – User Logon Data (SM04)


System Monitoring & Logs

SNAP – ABAP Runtime Errors (Short Dumps)
CDHDR / CDPOS – Change Document Header & Items
DBTABLOG – Table Change Logs
TBTCO / TBTCP – Background Jobs (Header + Steps)
APQI / APQD – Batch Input Queue & Data
E070 / E071 / E070C / E070V – Transport Requests & Tasks
TLOCK – Lock Table for Transports
JCDS / JEST – Status Change Documents
JSTO – Status Object Information


Spool, Text, Smart Forms & Printing

TSP01 – Spool Requests
TSP02 – Print Requests
TST01 / TST03 – TemSe (Temporary Sequential) Objects
STXH / STXL – SAPscript Text Header & Lines
STXFADM – Smart Forms Administration
STXB – Texts in Non-SAPscript Format
TTXOB / TTXID – Valid Text Objects & Text IDs
DOKIL / DOKHL / DOKTL – Documentation Tables


Number Ranges & Variants

NRIV – Number Range Intervals
TNRO – Number Range Objects
VARID / TVARV / VARI / VARIS – Report Variants & Variables
LTDX / LTDXD / LTDXS – ALV Display Layouts & Defaults
TCVIEW – Table Control Views (User Settings)


Enterprise Structure & Global Settings
Global Settings

T000 / T001 – Clients & Company Codes
T880 – Global Company Data
T005 / T005T – Countries
T006 – Units of Measure
TCURC / TCURT – Currency Codes & Texts
TCURR / TCURX – Exchange Rates & Decimal Places
T009 – Fiscal Year Variants
T010O / T010P – Posting Period Variants
TFACD – Factory Calendar
TTZZ / TTZD – Time Zones & Summer Time Rules
T247 / T015M – Month Names

Organizational Structure

TKA01 / TKA02 – Controlling Areas
T001W / T001L – Plants & Storage Locations
TVKO / TVTW / TSPA – Sales Organization, Distribution Channel, Division
T024E / T024W – Purchasing Organization
TVST – Shipping Points
TGSB – Business Areas


Master Data
Material Master

MARA / MAKT – General Material Data + Descriptions
MARC – Plant Data
MARD – Storage Location Data
MVKE – Sales Data
MBEW – Valuation Data
MARM – Unit of Measure Conversions

Customer Master

KNA1 – Customer General Data
KNB1 – Customer Company Code Data
KNVV – Customer Sales Area Data
KNVP – Customer Partner Functions
KNBK – Customer Bank Details

Vendor Master

LFA1 – Vendor General Data
LFB1 – Vendor Company Code Data
LFM1 / LFM2 – Vendor Purchasing Organization Data

Classification

CABN / CABNT – Characteristics
KLAH – Class Header
KSSK – Object to Class Assignment
AUSP – Characteristic Values

Business Address Services (BAS)

ADRC – Addresses
ADRP – Persons
ADCP – Person ↔ Address Assignment
ADR2 – Telephone Numbers


Financial Accounting (FI)
G/L Accounts

SKA1 / SKAT – G/L Accounts (Chart of Accounts)
SKB1 – G/L Accounts (Company Code)
T004 – Chart of Accounts Directory

Accounting Documents

BKPF – Accounting Document Header
BSEG – Accounting Document Line Items
BSID / BSAD – Customer Open / Cleared Items
BSIK / BSAK – Vendor Open / Cleared Items
BSIS / BSAS – G/L Open / Cleared Items
BSET – Tax Data
GLT0 – G/L Transaction Figures

Cost Centers & Controlling

CSKS / CSKT – Cost Center Master + Texts
CSKA / CSKB / CSKU – Cost Elements
CEPC – Profit Center Master
TKA01 / TKA02 – Controlling Area

Banks & House Banks

BNKA – Bank Master
T012 / T012K – House Banks & Accounts


Sales & Distribution (SD)

VBAK / VBAP – Sales Order Header & Items
VBKD – Sales Order Business Data
VBRK / VBRP – Billing Document Header & Items
LIKP / LIPS – Delivery Header & Items
VBFA – Sales Document Flow
KONH / KONP – Pricing Condition Header & Items


Materials Management (MM)

EKKO / EKPO – Purchase Order Header & Items
EBAN – Purchase Requisition
EINA / EINE – Purchase Info Records
MKPF / MSEG – Material Document (Goods Movement) Header & Items


Production Planning (PP)

AUFK / AFKO / AFPO – Production Order Header & Items
RESB – Reservations / Order Components
STKO / STPO – BOM Header & Items
PLKO / PLPO – Routing Header & Operations
CRHD – Work Center Header


Human Resources (HR/HCM)

PA0001 – Organizational Assignment
PA0002 – Personal Data
PA0007 – Planned Working Time
PA0008 – Basic Pay
T501 / T503 – Employee Groups & Subgroups


Additional Useful Tables
Payment & Treasury

T042* – Payment Program Configuration (many tables)
REGUH / REGUP – Payment Run Data

Archiving & Others

ARCH_OBJ – Archiving Objects
