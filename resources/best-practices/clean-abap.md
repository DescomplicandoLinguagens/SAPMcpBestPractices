Clean ABAP
This guide is an adoption of Robert C. Martin's Clean Code adapted for ABAP.
How to

How to Get Started with Clean Code
How to Refactor Legacy Code
How to Check Automatically
How to Relate to Other Guides
How to Disagree

Names

Use descriptive names
Prefer solution domain and problem domain terms
Use plural where appropriate (especially for collections)
Use pronounceable names
Use snake_case
Avoid abbreviations
Use the same abbreviations consistently everywhere
Use nouns for classes and verbs for methods
Avoid noise words such as "data", "info", "object"
Pick one word per concept
Use pattern names only if you actually mean and implement that pattern
Avoid encodings, especially Hungarian notation and any kind of prefixes
Avoid obscuring built-in functions with your own names

Language

Mind the legacy – balance modernization with readability and maintainability
Mind the performance – clean code should not come at unacceptable cost
Prefer object orientation to procedural programming
Prefer functional to procedural language constructs
Avoid obsolete language elements
Use design patterns wisely – only when they clearly improve the code

Constants

Use constants instead of magic numbers and magic strings
Constants also need descriptive names
Prefer ENUM (or enumeration classes) to constants interfaces
If ENUM or enumeration patterns are not used, group related constants logically

Variables

Prefer inline declarations to up-front declarations
Do not use variables outside of the statement block they are declared in
Do not chain up-front declarations
Do not use field symbols for dynamic data access unless truly necessary
Choose the right targets for your loops (e.g. TABLE or ASSIGNING)

Tables

Use the right table type for the use case
Avoid DEFAULT KEY
Prefer INSERT INTO TABLE to APPEND TO
Prefer LINE_EXISTS to READ TABLE or LOOP AT when checking existence
Prefer READ TABLE to LOOP AT when reading a single entry
Prefer LOOP AT … WHERE to nested IF inside LOOP
Avoid unnecessary table reads

Strings

Use ` to define string literals
Use | to assemble text (string templates)

Booleans

Use Booleans wisely – only for true yes/no decisions
Use ABAP_BOOL for Boolean variables
Use ABAP_TRUE and ABAP_FALSE for comparisons
Use XSDBOOL to set Boolean variables from conditions

Conditions

Try to make conditions positive
Prefer IS NOT to NOT IS
Consider using predicative method calls for Boolean methods
Consider decomposing complex conditions into helper variables or methods
Consider extracting complex conditions into appropriately named methods

Ifs

No empty IF branches
Prefer CASE to ELSE IF chains for multiple alternative conditions
Keep the nesting depth low

Regular expressions

Prefer simpler methods to regular expressions when possible
Prefer basis checks to regular expressions when sufficient
Consider assembling complex regular expressions from smaller, named parts

Classes
Object orientation

Prefer objects to static classes
Prefer composition to inheritance
Don't mix stateful and stateless behavior in the same class

Scope

Global by default, local only where appropriate
Use FINAL if the class is not designed for inheritance
Members PRIVATE by default, PROTECTED only if really needed
Consider using immutable objects instead of getters
Use READ-ONLY sparingly

Constructors

Prefer NEW to CREATE OBJECT
If a global class is CREATE PRIVATE, leave the CONSTRUCTOR public
Prefer multiple static creation methods to optional parameters
Use descriptive names for multiple creation methods
Make singletons only where multiple instances genuinely don't make sense

Methods
Calls

Don't call static methods through instance references
Don't access types through instance references
Prefer functional to procedural calls
Omit RECEIVING when possible
Omit the optional keyword EXPORTING
Omit the parameter name in single-parameter calls
Omit the self-reference me-> when calling instance attributes or methods

Object orientation

Prefer instance methods to static methods
Public instance methods should usually be part of an interface

Parameter Number

Aim for few IMPORTING parameters (ideally fewer than three)
Split methods instead of adding OPTIONAL parameters
Use PREFERRED PARAMETER sparingly
RETURN, EXPORT, or CHANGE exactly one parameter

Parameter Types

Prefer RETURNING to EXPORTING
RETURNING large tables is usually acceptable
Use either RETURNING or EXPORTING or CHANGING, but not a combination
Use CHANGING sparingly and only where it clearly fits the semantics

Parameter Names

Good method names usually make parameter names (especially RETURNING) unnecessary or obvious

Method Body

Do one thing, do it well, do it only
Focus on the happy path or error handling, but not both
Descend one level of abstraction
Keep methods small (ideally < 20 statements, optimal 3–5)

Control flow

Fail fast – validate and exit as early as possible
There is no strong consensus on CHECK vs RETURN for early exits (both have trade-offs)
Avoid CHECK outside the initialization section of a method

Error Handling
Messages

Make messages easy to find (e.g. via where-used list in SE91)

Return Codes

Prefer exceptions to return codes

Exceptions

Exceptions are for errors, not for regular cases
Use class-based exceptions
Use own abstract super classes for your exception hierarchy
Throw one main type of exception in most cases
Use sub-classes to allow callers to distinguish error situations when needed
Throw CX_STATIC_CHECK for expected, manageable exceptions
Throw CX_NO_CHECK for usually unrecoverable situations
