export interface Institution {
  id: string;
  name: string;
  city: string;
  state: string;
  category: "Engineering" | "Management" | "Commerce" | "University" | "Medical" | "General";
}

export const SUPPORTED_INSTITUTIONS: Institution[] = [
  // Delhi NCR
  { id: "du_srcc", name: "Shri Ram College of Commerce (SRCC), Delhi", city: "New Delhi", state: "Delhi", category: "Commerce" },
  { id: "du_hindu", name: "Hindu College, Delhi University", city: "New Delhi", state: "Delhi", category: "University" },
  { id: "du_stephens", name: "St. Stephen's College, Delhi", city: "New Delhi", state: "Delhi", category: "University" },
  { id: "iit_delhi", name: "IIT Delhi", city: "New Delhi", state: "Delhi", category: "Engineering" },
  { id: "dtu", name: "Delhi Technological University (DTU)", city: "New Delhi", state: "Delhi", category: "Engineering" },
  { id: "nsut", name: "Netaji Subhas University of Technology (NSUT)", city: "New Delhi", state: "Delhi", category: "Engineering" },
  { id: "ashoka", name: "Ashoka University", city: "Sonipat", state: "Haryana", category: "University" },
  
  // Maharashtra & West
  { id: "iit_bombay", name: "IIT Bombay", city: "Mumbai", state: "Maharashtra", category: "Engineering" },
  { id: "st_xaviers_mum", name: "St. Xavier's College, Mumbai", city: "Mumbai", state: "Maharashtra", category: "Commerce" },
  { id: "narsee_monjee", name: "NMIMS / Narsee Monjee College", city: "Mumbai", state: "Maharashtra", category: "Commerce" },
  { id: "vjti", name: "Veermata Jijabai Technological Institute (VJTI)", city: "Mumbai", state: "Maharashtra", category: "Engineering" },
  { id: "coep", name: "COEP Technological University", city: "Pune", state: "Maharashtra", category: "Engineering" },
  { id: "symbiosis_pune", name: "Symbiosis International University", city: "Pune", state: "Maharashtra", category: "University" },
  { id: "iim_ahmedabad", name: "IIM Ahmedabad", city: "Ahmedabad", state: "Gujarat", category: "Management" },

  // Karnataka & South
  { id: "iisc", name: "Indian Institute of Science (IISc)", city: "Bengaluru", state: "Karnataka", category: "University" },
  { id: "iim_bangalore", name: "IIM Bangalore", city: "Bengaluru", state: "Karnataka", category: "Management" },
  { id: "rvce", name: "RV College of Engineering", city: "Bengaluru", state: "Karnataka", category: "Engineering" },
  { id: "pesu", name: "PES University", city: "Bengaluru", state: "Karnataka", category: "Engineering" },
  { id: "christ_univ", name: "Christ University", city: "Bengaluru", state: "Karnataka", category: "University" },
  { id: "manipal", name: "Manipal Academy of Higher Education (MAHE)", city: "Manipal", state: "Karnataka", category: "University" },
  { id: "iit_madras", name: "IIT Madras", city: "Chennai", state: "Tamil Nadu", category: "Engineering" },
  { id: "loyola_chennai", name: "Loyola College", city: "Chennai", state: "Tamil Nadu", category: "Commerce" },
  { id: "anna_univ", name: "Anna University", city: "Chennai", state: "Tamil Nadu", category: "Engineering" },
  { id: "iit_hyderabad", name: "IIT Hyderabad", city: "Hyderabad", state: "Telangana", category: "Engineering" },
  { id: "bits_pilani", name: "BITS Pilani (Main / Goa / Hyderabad)", city: "Pilani", state: "Rajasthan", category: "Engineering" },

  // Rajasthan & North
  { id: "mnit_jaipur", name: "MNIT Jaipur", city: "Jaipur", state: "Rajasthan", category: "Engineering" },
  { id: "rajasthan_univ", name: "University of Rajasthan", city: "Jaipur", state: "Rajasthan", category: "University" },
  { id: "iit_jodhpur", name: "IIT Jodhpur", city: "Jodhpur", state: "Rajasthan", category: "Engineering" },
  { id: "iit_roorkee", name: "IIT Roorkee", city: "Roorkee", state: "Uttarakhand", category: "Engineering" },
  { id: "iit_kanpur", name: "IIT Kanpur", city: "Kanpur", state: "Uttar Pradesh", category: "Engineering" },
  { id: "bhu", name: "Banaras Hindu University (BHU)", city: "Varanasi", state: "Uttar Pradesh", category: "University" },

  // East
  { id: "iit_kharagpur", name: "IIT Kharagpur", city: "Kharagpur", state: "West Bengal", category: "Engineering" },
  { id: "st_xaviers_kol", name: "St. Xavier's College, Kolkata", city: "Kolkata", state: "West Bengal", category: "Commerce" },
  { id: "jadavpur_univ", name: "Jadavpur University", city: "Kolkata", state: "West Bengal", category: "Engineering" },
];

export function searchInstitutions(query: string): Institution[] {
  const q = query.trim().toLowerCase();
  if (!q) return SUPPORTED_INSTITUTIONS.slice(0, 10);
  return SUPPORTED_INSTITUTIONS.filter(
    (inst) =>
      inst.name.toLowerCase().includes(q) ||
      inst.city.toLowerCase().includes(q) ||
      inst.state.toLowerCase().includes(q) ||
      inst.category.toLowerCase().includes(q)
  );
}
