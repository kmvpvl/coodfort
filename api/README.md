COODFort API
# Description

# API
[Roles](#roles) | [Security schemas](#security-schemas) | [Paths](#paths) | [Structures and classes](#structures-and-classes)
## Roles
Role is the complex object. Every permission is a structure.
```javascript
{
    role: string;           // name of role
    objects?: {             // array of objects which permissions issued to
        type: string;       // type of objects, or wildcard *
        id: Types.ObjectId  // unique ids of objects, or wildcard *
    }[];
}
```
### `Supervisor` role
Supervisor role has all roles to all objects everywhere
### `Owner` role
Owner role has all permission in one or more Eateries. Every Eatery has at least one employee with Owner role. You can't delete last Owner role
### `MDM` role
## Security schemas
## Paths
Name|Description
-|-
[eatery/edit](#post-eateryedit)|Changes existing eatery object
[eatery/new](#post-eaterynew)|Creates new eatery object
[version](#get-version)|Returns current API version
#### GET `version`
### Working with EATERY class
Working with|Methods
-|-
Eatery root object and master data| [eatery/new](#post-eaterynew), [eatery/update](#post-eateryupdate), [eatery/view](#post-eateryview), eatery/checkout, eatery/checkin,  [eatery/publish](#post-eaterypublish), eatery/table/new, eatery/table/update, eatery/table/block
Employees of Eatery| eatery/employee/invite, eatery/employee/update, eatery/employee/fire
Delivery partners of Eatery| eatery/deliveryPartner/add,  eatery/deliveryPartner/edit
PaymentMethods of Eatery| eatery/paymentMethod/add,  eatery/paymentMethod/edit
Promos and Discounts| eatery/promo/add, eatery/promo/edit
Entertainment calendar of Eatery| eatery/entertainment/add,  eatery/entertainment/edit
Meals and Drinks menu|meal/add, meal/update, meal/spread, meal/search, meal/view
Bookings|eatery/book/approve, eatery/book/reject
Order|eatery/order/approve, eatery/order/reject, eatery/order/payment/recieve
Payments|eatery/pay

#### POST `eatery/view`
Reveals information about Eatery by its unique id. If an Employee of Eatery requests the information then IEatory object includes the employees array. Else the employee array is absent

*Parameters*
Mand|Parameter|Where|Type|Description
-|-|-|-|-
✅|coodfort-login|header|string|Login name of Employee or Guest 
✅|coodfort-password|header|string|Password of Employee or Guest
✅|id|requestBody|number|Unique id of the Eatery

*Returns*

HTTP status|Condition|Response body
-|-|-
200|Information about Eatery was collected successfully| See below
400|Some Request mandatory feilds are undefined|See below
401|Eatery information couldn't be collected because Employee or Guest sent wrong login-password pair|See below
403|Eatery information couldn't be collected because Employee or Guest was blocked

Response body if successful
```javascript
{
    ok: true, 
    employee: IEatery
}
```
Response body if error
```javascript
{
    ok: false,
    error: {
        code: code_number,
        shortName: short_string_error,
        message: error_description
    } 
}
```

#### POST `eatery/publish`
Sets `approve` status to Eatery object and reveals information about Eatery by its unique id. Employee MUST have `MDM` role to execute this operation

*Parameters*
Mand|Parameter|Where|Type|Description
-|-|-|-|-
✅|coodfort-login|header|string|Login name of Employee 
✅|coodfort-password|header|string|Password of Employee
✅|id|requestBody|number|Unique id of the Eatery

*Returns*

HTTP status|Condition|Response body
-|-|-
200|Information about Eatery was collected successfully| See below
400|Some Request mandatory feilds are undefined|See below
401|Eatery information couldn't be collected because Employee sent wrong login-password pair|See below
403|Eatery information couldn't be collected because Employee was blocked

Response body if successful
```javascript
{
    ok: true, 
    employee: IEatery
}
```
Response body if error
```javascript
{
    ok: false,
    error: {
        code: code_number,
        shortName: short_string_error,
        message: error_description
    } 
}
```


#### POST `eatery/new`
Creates new Eatery. User MUST be Employee to create new Eatery. Guest can't create new Eatery. 
*Parameters*
Mand|Parameter|Where|Type|Description
-|-|-|-|-
✅|coodfort-login|header|string|Login name of Employee (future owner of the Eatery)
✅|coodfort-password|header|string|Password of Employee (future owner of the Eatery)
✅|name|requestBody|string|Display name of Eatery
❌|tables|requestBody|array of ITable|Tables of Eatery
❌|description|requestBody|string|Description of Eatery
❌|url|requestBody|string|URL to Eatery
❌|cuisines|requestBody|Comma separated string|List of cuisines
❌|tags|requestBody|Array of strings|Tags of Eatery

*Returns*

HTTP status|Condition|Response body
-|-|-
200|New Eatery was created successfully| See below
400|Eatery wasn't created because mandattory feilds are undefined|See below
401|Eatery wasn't created because Employee sent wrong login-password pair|See below
403|Eatery wasn't created because Employee was blocked

Response body if successful
```javascript
{
    ok: true, 
    employee: IEatery
}
```
Response body if error
```javascript
{
    ok: false,
    error: {
        code: code_number,
        shortName: short_string_error,
        message: error_description
    } 
}
```

#### POST `eatery/edit`

#### POST `eatery/update`
Changes Eatery data. User MUST:
* be Employee 
* belong to the Eatery
* have role MDM.

*Parameters*
Mand|Parameter|Where|Type|Description
-|-|-|-|-
✅|coodfort-login|header|string|Login name of Employee
✅|coodfort-password|header|string|Password of Employee
✅|id|requestBody|number|Unique id of Eatery
✅|name|requestBody|string|Name of Eatery
❌|tables|requestBody|array of ITable|Tables of Eatery
❌|description|requestBody|string|Description of Eatery
❌|url|requestBody|string|URL to Eatery
❌|cuisines|requestBody|Comma separated string|List of cuisines
❌|tags|requestBody|Array of strings|Tags of Eatery

*Returns*

HTTP status|Condition|Response body
-|-|-
200|Eatery was changed successfully| See below
400|Eatery wasn't changed because mandatory feilds are undefined|See below
401|Eatery wasn't changed because Employee sent wrong login-password pair|See below
403|Eatery wasn't changed because Employee was blocked

Response body if successful
```javascript
{
    ok: true, 
    employee: IEatery
}
```
Response body if error
```javascript
{
    ok: false,
    error: {
        code: code_number,
        shortName: short_string_error,
        message: error_description
    } 
}
```

#### POST `eatery/approve`
Makes changes to existing Eatery object. User MUST be Employee and have permissions of role [MDM](#mdm-role).
#### POST `eatery/employee/invite`
#### POST `eatery/employee/edit`
#### POST `eatery/employee/fire`
### Working with EMPLOYEE class
Working with|Methods
-|-
Employee root object|[employee/new](#post-employeenew), employee/edit, employee/view
Invitations from Eateries|employee/acceptInvitation, employee/rejectInvitation
Working with Eateries as owner|[employee/eateriesList](#post-employeeeaterieslist), [employee/mealsList](#post-employeemealslist)

#### POST `employee/new`
Creates new Employee object. This method is used for Employee registration by web application. If you want register new Employee by Telegram, use `/start` command.

[!CAUTION] This method doesn't require any security schema. 

*Parameters*
Mand|Parameter|Where|Type|Description
-|-|-|-|-
✅|coodfort-login|header|string|Login name of Employee
✅|coodfort-password|header|string|Password of Employee
❌|name|requestBody|string|Display name of Employee
❌|bio|requestBody|string|Bio of Employee
❌|tags|requestBody|Array of strings|Tags of Employee

*Returns*

HTTP status|Condition|Response body
-|-|-
200|New Employee was created successfully| See below
400|Employee wasn't created because Login name already exists|See below

Response body if successful
```javascript
{
    ok: true, 
    employee: IEmployee
}
```
Response body if error
```javascript
{
    ok: false,
    error: {
        code: code_number,
        shortName: short_string_error,
        message: error_description
    } 
}
```

#### POST `employee/eateriesList`
Reveals list of all Eateries created by Employee.

*Parameters*
Mand|Parameter|Where|Type|Description
-|-|-|-|-
✅|coodfort-login|header|string|Login name of Employee
✅|coodfort-password|header|string|Password of Employee

*Returns*

HTTP status|Condition|Response body
-|-|-
200|Array of IEatery structures| See below
401|Unknown Employee|See below

Response body if successful
```javascript
{
    ok: true, 
    employee: IEatery[]
}
```
Response body if error
```javascript
{
    ok: false,
    error: {
        code: code_number,
        shortName: short_string_error,
        message: error_description
    } 
}
```

#### POST `employee/mealsList`
Reveals list of all Meals created by Employee.

*Parameters*
Mand|Parameter|Where|Type|Description
-|-|-|-|-
✅|coodfort-login|header|string|Login name of Employee
✅|coodfort-password|header|string|Password of Employee

*Returns*

HTTP status|Condition|Response body
-|-|-
200|Array of IMeal structures| See below
401|Unknown Employee|See below

Response body if successful
```javascript
{
    ok: true, 
    employee: IMeal[]
}
```
Response body if error
```javascript
{
    ok: false,
    error: {
        code: code_number,
        shortName: short_string_error,
        message: error_description
    } 
}
```
### Working with MEAL class
Working with|Methods
-|-
Creating, updating meals|[meal/new](#post-mealnew), meal/update, meal/block

#### POST `meal/new`
Creates new meal and returns IMeal structure
*Parameters*
Mand|Parameter|Where|Type|Description
-|-|-|-|-
✅|coodfort-login|header|string|Login name of Employee
✅|coodfort-password|header|string|Password of Employee

*Returns*

HTTP status|Condition|Response body
-|-|-
200|Array of IEatery structures| See below
401|Unknown Employee|See below

Response body if successful
```javascript
{
    ok: true, 
    employee: IEatery[]
}
```
Response body if error
```javascript
{
    ok: false,
    error: {
        code: code_number,
        shortName: short_string_error,
        message: error_description
    } 
}
```

### Working with GUEST class
Working with|Methods
-|-
Guest root object|guest/view, [guest/new](#post-guestnew), [guest/edit](#post-guestedit), [guest/join](#post-guestjoin), guest/search
Booking|guest/eatery/search, guest/eatery/table/view, guest/book/new, guest/book/cancel 
Order|guest/order/inviteGuest, guest/order/acceptInvitation, guest/order/rejectInvitation, 
Meals of order|guest/eatery/meals/veiw, guest/order/meal/add, guest/order/meal/approve
Pay of Order|guest/order/payment/send, guest/order/promo/apply
Promos and discounts|guest/promo/view

#### POST `guest/new`
Creates new Guest object.
#### POST `guest/edit`
Makes changes to existing Guest object.
#### POST `guest/join`
Unites two Guest objects. It's useful when user had been an anonymous guest, had booked table or had ordered and decided to sign them in.
## Structures and Classes
### `Guest` class
* Properties
* Methods

Name|Parameters|Return|Description
-|-|-|-
checkSecretKey|secretKey: string|boolean
### `Employee` class
* Properties
