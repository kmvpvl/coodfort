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
### `Admin` role
Admin role has all permission in one or more Eateries. Every Eatery has at least one employee with Admin role. You can't delete last Admin role
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
Eatery root object and master data| eatery/new,  eatery/edit,  eatery/publish
Employees of Eatery| eatery/employee/invite, eatery/employee/edit, eatery/employee/fire
Delivery partners of Eatery| eatery/deliveryPartner/add,  eatery/deliveryPartner/edit
PaymentMethods of Eatery| eatery/paymentMethod/add,  eatery/paymentMethod/edit
Promos and Discounts| eatery/promo/add,  eatery/promo/edit
Entertainment calendar of Eatery| eatery/entertainment/add,  eatery/entertainment/edit
Meals and Drinks menu|eatery/meal/add, eatery/meal/edit, eatery/meal/search, eatery/meal/view
Bookings|eatery/book/approve, eatery/book/reject
Order|eatery/order/approve, eatery/order/reject, eatery/order/payment/recieve
Payments|eatery/pay

#### POST `eatery/new`
Creates new Eatery. User MUST be Employee to create new Eatery. Guest can't create new Eatery
#### POST `eatery/edit`
#### POST `eatery/publish`
Makes changes to existing Eatery object. User MUST be Employee and have permissions of role [MDM](#mdm-role).
#### POST `eatery/employee/invite`
#### POST `eatery/employee/edit`
#### POST `eatery/employee/fire`
### Working with EMPLOYEE class
Working with|Methods
-|-
Employee root object|[employee/new](#post-employeenew), employee/edit
Invitations from Eateries|employee/acceptInvitation, employee/rejectInvitation

#### POST `employee/new`
Creates new Employee object. 

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
