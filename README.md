# Sew Organized

## Developers
* Dakota Druley
* Jenna Goldman
* Janelle Mellor
* Dannie Schumaker
* Chelsea Spangler


## Problem Domain
* Cross-stitchers and other crafters benefit from having all supplies on hand when beginning projects.
* The confusing DMC numbering systems and disorganized embroidery floss displays at craft stores can be overwhelming.  
  * The DMC color numbers do not consistently correspond to color families. 
  * Each time a colors are added, it becomes more confusing. 
  * Even if you put in the work to organize your stash carefully, the DMC color numbers are not easily accessible. 
* Without a streamlined organization system, crafters lose track of what they already own (and how much they have). 

**This app allows crafters to:**
* Search for an embroidery floss by its DMC number or name
  * Save the floss color to their personal stash
    * Update it with the correct quantity
    * Delete it
  * Find a similar color when they lack the required floss
* Generate and save palettes for color inspiration


## Required libraries/packages
* react
* react-router-dom
* react-sidenav


## API endpoints
### DMC Floss Colors
Returned color objects take this shape:
[
  {
    id: "3811",
    description: "Turquoise Very Light",
    red: 188,
    green: 227,
    blue: 230,
    hex: "BCE3E6"
  }
]

**GET**
* /api/colors
  * gets all dmc colors

* /api/detail/:id
  * gets single dmc color from database by id (from params)

* /api/colors/search
  * gets single dmc color from database by id (from search query)

* /api/colors/namesearch
  * gets colors from database based on search query

* /api/username/stash
  * gets user's stash
  * authenticaated

**POST**
* /api/username/stash
  * adds color to user's stash
  * authenticaated

* /api/username/palettes
  * adds color palette to user's favorite palettes
  * authenticaated

**PUT**
* /api/username/stash/:id
  * updates item in user's stash
  * authenticaated

**DELETE**
* /api/username/stash/:id
  * deletes item from user's stash
  * authenticaated

### Generated Color Schemes
Generated color scheme is an array of five objects containing rgb color values:
[
  { r: 249, g: 6, b: 6 },
  { r: 251, g: 55, b: 55 },
  { r: 253, g: 104, b: 104 },
  { r: 254, g: 154, b: 154 },
  { r: 255, g: 204, b: 204 }
]

**GET**
* /api/scheme
  * gets complementary color schemes using randomly generated starting color

* /api/scheme/:id
  * gets monochromatic color scheme using dmc id of starting color

### Saved Color Palettes
Color palettes include palette name and five dmc color objects:
[
    {
        id: 40,
        palette_name: "Twilight",
        dmc_one: 
          { 
            id: "939", description: "Navy Blue Very Dark",red: 27, green: 40, blue: 83, hex: "1B2853" 
            },
        dmc_two: 
          { 
            id: "939", description: "Navy Blue Very Dark",red: 27, green: 40, blue: 83, hex: "1B2853" 
            },
        dmc_three: 
          { 
            id: "700", description: "Green Bright", red: 7,green: 115, blue: 27, hex: "07731B"
            },
        dmc_four: 
          {
            id: "911", description: "Emerald Green Med",red: 24, green: 144, blue: 101, hex: "189065"
            },
        dmc_five: 
          {
            id: "3812", description: "Sea Green Vy Dk",red: 47, green: 140, blue: 132, hex: "2F8C84"
            },
        user_id: 12
    }
]

**GET**
* /api/username/palettes
  * gets user's saved color palettes
  * authenticaated

**POST**
* /api/username/palettes
  * adds color palette to user's favorite palettes
  * authenticaated

**DELETE**
* /api/username/palettes/:id
  * deletes item from user's favorite palettes
  * authenticaated


## SQL Database Schemas
**Tables**
* users
  * columns:
    * id (serial)
    * email
    * displayName
    * hash
  
* dmc_colors
  * columns:
    * id (dmc color id)
    * description (dmc color name)
    * red
    * green 
    * blue
    * hex
  
* stash
  * columns:
    * id (serial)
    * dmc_id (references dmc_color.id)
    * quantity
    * user_id (references users.id)
  
* palettes
  * columns:
    * id (serial)
    * palette_name
    * dmc_one
    * dmc_two
    * dmc_three
    * dmc_four
    * dmc_five
    * user_id (references users.id)
