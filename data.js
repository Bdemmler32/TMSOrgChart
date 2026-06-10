/**
 * TMS Staff Organization Data
 * Last updated: 2026-05-01
 *
 * HOW TO UPDATE:
 * - Each person has a unique "id" (never change this — it links to their headshot filename)
 * - "photo" should match the filename in assets/headshots/
 * - Department colors are defined in styles.css under :root
 * - To add a person: copy an existing entry, give it a new unique id, and add it to the correct department's "members" array
 * - To add a department: copy a department block and add it to the DEPARTMENTS array
 */

const TMS_DATA = {
  org: {
    executive: {
      id: "trudi-dunlap",
      name: "Trudi Dunlap",
      title: "Executive Director and Chief Executive Officer",
      ext: "275",
      direct: "724-814-3174",
      email: "tdunlap@tms.org",
      photo: "Dunlap,-Trudi_2025.jpg"
    },

    deputyExecutive: {
      id: "adrianne-carolla",
      name: "Adrianne Carolla",
      title: "Deputy Executive Director",
      ext: "219",
      direct: "724-814-3180",
      email: "acarolla@tms.org",
      photo: "Carolla,-Adrianne_2025.jpg"
    },

    // Administrative staff that report directly to executive (left column)
    executiveStaff: [
      {
        id: "sarah-huffman",
        name: "Sarah Huffman",
        title: "Administrative Assistant",
        ext: "230",
        direct: "724-814-3186",
        email: "shuffman@tms.org",
        photo: "Huffman,-Sarah_2025.jpg"
      },
      {
        id: "paul-zappas",
        name: "Paul Zappas",
        title: "Senior Manager, Information Technology",
        ext: "223",
        direct: "724-814-3126",
        email: "zappas@tms.org",
        photo: "Zappas,-Paul_2022.jpg"
      }
    ],

    departments: [
      {
        id: "events",
        name: "Events, Programming, and Sales",
        color: "yellow",
        head: {
          id: "diane-scheuring",
          name: "Diane Scheuring",
          title: "Department Head",
          ext: "210",
          direct: "724-814-3110",
          email: "dscheuring@tms.org",
          photo: "Scheuring.-Diane_2025-copy.jpg"
        },
        members: [
          {
            id: "jeff-gnacinski",
            name: "Jeff Gnacinski",
            title: "Programming Manager",
            ext: "248",
            direct: "724-814-3166",
            email: "jgnacinski@tms.org",
            photo: "Gnacinski_Jeffrey_2026.jpg"
          },
          {
            id: "tess-killeen",
            name: "Tess Killeen",
            title: "Specialty Events Lead",
            ext: "213",
            direct: "724-814-3116",
            email: "tdejong@tms.org",
            photo: "Killeen,-Tess_2022.jpg"
          },
          {
            id: "kellye-parsson",
            name: "Kellye Parsson",
            title: "Global Conferences and Events Manager",
            ext: "216",
            direct: "724-814-3194",
            email: "kparsson@tms.org",
            photo: "Parsson_Kellye_2026.jpg"
          },
          {
            id: "colleen-madore",
            name: "Colleen Madore",
            title: "Programming and Virtual Events Specialist",
            ext: "227",
            direct: "724-814-3134",
            email: "cmadore@tms.org",
            photo: "Madore_Colleen_2026.jpg"
          },
          {
            id: "patricia-warren",
            name: "Patricia Warren",
            title: "Programming and Proceedings Specialist",
            ext: "239",
            direct: "724-814-3152",
            email: "pwarren@tms.org",
            photo: "Warren_Patricia_2026.jpg"
          }
        ]
      },

      {
        id: "member-services",
        name: "Member Services and Recognition",
        color: "green",
        head: {
          id: "courtney-hammer",
          name: "Courtney Hammer",
          title: "Department Head",
          ext: "259",
          direct: "724-814-3172",
          email: "chammer@tms.org",
          photo: "Hammer,-Courtney_2021.jpg"
        },
        members: [
          {
            id: "janel-show",
            name: "Janel Show",
            title: "Volunteer and Customer Service Manager",
            ext: "241",
            direct: "724-814-3156",
            email: "jshow@tms.org",
            photo: "Show_Janel_2026.jpg"
          },
          {
            id: "deborah-hixon",
            name: "Deborah Hixon",
            title: "Awards Program Manager",
            ext: "232",
            direct: "724-814-3142",
            email: "hixon@tms.org",
            photo: "Hixon_Deborah_2026.jpg"
          },
          {
            id: "diana-grady",
            name: "Diana Grady",
            title: "Customer and Administrative Services Specialist",
            ext: "211",
            direct: "724-814-3112",
            email: "dgrady@tms.org",
            photo: "Grady,-Diana_2022.jpg"
          },
          {
            id: "joni-gregg",
            name: "Joni Gregg",
            title: "Technical Divisions Administrator",
            ext: "222",
            direct: "724-814-3124",
            email: "jgregg@tms.org",
            photo: "Gregg,-Joni_2011.jpg"
          }
        ]
      },

      {
        id: "content",
        name: "Content",
        color: "blue-light",
        head: {
          id: "matt-baker",
          name: "Matt Baker",
          title: "Department Head",
          ext: "280",
          direct: "724-814-3176",
          email: "mbaker@tms.org",
          photo: "Baker,-Matt_2022.jpg"
        },
        members: [
          {
            id: "kelly-markel",
            name: "Kelly Markel",
            title: "Publications Managing Editor",
            ext: "281",
            direct: "724-814-3108",
            email: "kmarkel@tms.org",
            photo: "Markel_Kelly_2026.jpg"
          }
        ]
      },

      {
        id: "marketing",
        name: "Marketing and Communications",
        color: "blue",
        head: {
          id: "ashley-anne-bohnert",
          name: "Ashley-Anne Bohnert",
          title: "Department Head",
          ext: "224",
          direct: "724-814-3188",
          email: "abohnert@tms.org",
          photo: "Bohnert_Ashley_2026.jpg"
        },
        members: [
          {
            id: "beate-helsel",
            name: "Beate Helsel",
            title: "Senior Manager, Research, Engagement, Data, and Information",
            ext: "220",
            direct: "724-814-3182",
            email: "bhelsel@tms.org",
            photo: "Helsel_Beate_2026.jpg"
          },
          {
            id: "kelly-zappas",
            name: "Kelly Zappas",
            title: "JOM: The Magazine Editor/Membership Communications Manager",
            ext: "218",
            direct: "724-814-3122",
            email: "kzappas@tms.org",
            photo: "Zappas,-Kelly_2025.jpg"
          },
          {
            id: "megan-enright",
            name: "Megan Enright",
            title: "Marketing Administrator",
            ext: "243",
            direct: "724-814-3106",
            email: "menright@tms.org",
            photo: "Enright,-Megan_2022.jpg"
          },
          {
            id: "jillian-schultz",
            name: "Jillian Schultz",
            title: "Digital Engagement Specialist",
            ext: "236",
            direct: "724-814-3168",
            email: "jschultz@tms.org",
            photo: "Schultz_Jillian_2026.jpg"
          },
          {
            id: "dave-rasel",
            name: "Dave Rasel",
            title: "Senior Manager, Brand and Digital Assets",
            ext: "242",
            direct: "724-814-3158",
            email: "drasel@tms.org",
            photo: "Rasel,-Dave_2026.jpg"
          },
          {
            id: "bob-demmler",
            name: "Bob Demmler",
            title: "AI Integration and Visual Communications Specialist",
            ext: "217",
            direct: "724-814-3120",
            email: "bdemmler@tms.org",
            photo: "Demmler,-Bob_2025.jpg"
          },
          {
            id: "cheryl-geier",
            name: "Cheryl Geier",
            title: "Senior Graphic Designer",
            ext: "240",
            direct: "724-814-3154",
            email: "cgeier@tms.org",
            photo: "Geier,-Cheryl_2022.jpg"
          },
          {
            id: "ken-grzegorczyk",
            name: "Ken Grzegorczyk",
            title: "Full Stack Developer and Webmaster",
            ext: "255",
            direct: "724-814-3164",
            email: "kgrzegorczyk@tms.org",
            photo: "Grzegorczyk,-Ken_2016.jpg"
          }
        ]
      },

      {
        id: "finance",
        name: "Finance",
        color: "pink",
        head: {
          id: "alicia-arbuckle",
          name: "Alicia Arbuckle",
          title: "Controller and Department Head",
          ext: "235",
          direct: "724-814-3146",
          email: "aarbuckle@tms.org",
          photo: "Arbuckle,-Alicia_2022.jpg"
        },
        members: [
          {
            id: "marleen-schrader",
            name: "Marleen Schrader",
            title: "Accounting and Grants Manager",
            ext: "245",
            direct: "724-814-3178",
            email: "mschrader@tms.org",
            photo: "Schrader,-Marleen_2011.jpg"
          }
        ]
      }
    ]
  },

  meta: {
    organization: "The Minerals, Metals & Materials Society",
    shortName: "TMS",
    address: "5700 Corporate Drive Suite 750, Pittsburgh, PA 15237 USA",
    phone: "1-724-776-9000",
    fax: "1-724-776-3770",
    website: "www.tms.org",
    directoryDate: "May 1, 2026"
  }
};
