export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  department: string;
  organizer: string;
  attendees: number;
  maxAttendees: number;
  image: string;
  tags: string[];
  isRsvped?: boolean;
}

export const categories = [
  "All",
  "Academic",
  "Cultural",
  "Sports",
  "Workshop",
  "Social",
  "Career",
  "Technical",
] as const;

export const departments = [
  "All",
  "Computer Science",
  "Business",
  "Arts & Humanities",
  "Engineering",
  "Sciences",
  "Athletics",
  "Student Affairs",
] as const;

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "AI & Machine Learning Workshop",
    description: "Dive deep into neural networks, transformers, and hands-on projects with TensorFlow. Perfect for beginners and intermediate learners looking to build real-world AI applications.",
    date: "2026-02-20",
    time: "2:00 PM",
    location: "Tech Hall, Room 301",
    category: "Workshop",
    department: "Computer Science",
    organizer: "CS Department",
    attendees: 45,
    maxAttendees: 60,
    image: "",
    tags: ["AI", "Python", "Hands-on"],
    isRsvped: true,
  },
  {
    id: "2",
    title: "Spring Cultural Festival",
    description: "Celebrate diversity with performances, food stalls, art exhibitions, and interactive cultural booths from student organizations around the world.",
    date: "2026-03-05",
    time: "10:00 AM",
    location: "Central Quad",
    category: "Cultural",
    department: "Student Affairs",
    organizer: "Student Union",
    attendees: 320,
    maxAttendees: 500,
    image: "",
    tags: ["Music", "Food", "Art"],
  },
  {
    id: "3",
    title: "Startup Pitch Night",
    description: "Watch student entrepreneurs pitch their startups to a panel of VC judges. Network with founders and investors over refreshments.",
    date: "2026-02-28",
    time: "6:00 PM",
    location: "Business School Auditorium",
    category: "Career",
    department: "Business",
    organizer: "Entrepreneurship Club",
    attendees: 89,
    maxAttendees: 150,
    image: "",
    tags: ["Startups", "Networking", "Pitch"],
  },
  {
    id: "4",
    title: "Intramural Basketball Tournament",
    description: "Sign up your team for the annual intramural basketball tournament. Prizes for top 3 teams!",
    date: "2026-03-12",
    time: "9:00 AM",
    location: "Sports Complex",
    category: "Sports",
    department: "Athletics",
    organizer: "Athletics Department",
    attendees: 120,
    maxAttendees: 200,
    image: "",
    tags: ["Basketball", "Team", "Competition"],
  },
  {
    id: "5",
    title: "Research Symposium 2026",
    description: "Faculty and students present cutting-edge research across disciplines. Poster sessions, keynote talks, and Q&A panels.",
    date: "2026-03-18",
    time: "1:00 PM",
    location: "Science Center",
    category: "Academic",
    department: "Sciences",
    organizer: "Research Office",
    attendees: 200,
    maxAttendees: 300,
    image: "",
    tags: ["Research", "Academic", "Poster"],
  },
  {
    id: "6",
    title: "Open Mic & Poetry Night",
    description: "Share your talents! Sing, recite poetry, do stand-up comedy, or just enjoy the performances with free coffee.",
    date: "2026-02-22",
    time: "7:30 PM",
    location: "Student Lounge",
    category: "Social",
    department: "Arts & Humanities",
    organizer: "Arts Collective",
    attendees: 55,
    maxAttendees: 80,
    image: "",
    tags: ["Poetry", "Music", "Fun"],
  },
  {
    id: "7",
    title: "Cybersecurity Bootcamp",
    description: "Learn about ethical hacking, penetration testing, and secure coding practices in this intensive one-day bootcamp.",
    date: "2026-03-01",
    time: "9:00 AM",
    location: "Tech Hall, Room 105",
    category: "Technical",
    department: "Computer Science",
    organizer: "Cybersecurity Club",
    attendees: 40,
    maxAttendees: 40,
    image: "",
    tags: ["Security", "Hacking", "Coding"],
  },
  {
    id: "8",
    title: "Career Fair 2026",
    description: "Meet recruiters from 50+ companies. Bring your resume and dress professionally. Open to all majors and graduation years.",
    date: "2026-03-22",
    time: "10:00 AM",
    location: "Convention Center",
    category: "Career",
    department: "Business",
    organizer: "Career Services",
    attendees: 450,
    maxAttendees: 800,
    image: "",
    tags: ["Jobs", "Internships", "Networking"],
  },
  {
    id: "9",
    title: "Yoga & Mindfulness Retreat",
    description: "Take a break from exams with a guided yoga session and mindfulness exercises in the campus garden.",
    date: "2026-02-25",
    time: "7:00 AM",
    location: "Campus Garden",
    category: "Social",
    department: "Student Affairs",
    organizer: "Wellness Center",
    attendees: 25,
    maxAttendees: 30,
    image: "",
    tags: ["Wellness", "Yoga", "Relaxation"],
  },
  {
    id: "10",
    title: "Annual Hackathon",
    description: "24-hour coding marathon! Form teams to build innovative solutions. Prizes worth $5,000. Beginner-friendly with mentor support.",
    date: "2026-04-05",
    time: "6:00 PM",
    location: "Innovation Lab",
    category: "Technical",
    department: "Engineering",
    organizer: "ACM Student Chapter",
    attendees: 95,
    maxAttendees: 100,
    image: "",
    tags: ["Coding", "Innovation", "Prizes"],
  },
  {
    id: "11",
    title: "Film Screening: Documentary Night",
    description: "Watch award-winning student documentaries followed by Q&A with the filmmakers. Free popcorn included!",
    date: "2026-03-08",
    time: "6:30 PM",
    location: "Media Arts Theater",
    category: "Cultural",
    department: "Arts & Humanities",
    organizer: "Film Society",
    attendees: 60,
    maxAttendees: 120,
    image: "",
    tags: ["Film", "Documentary", "Art"],
  },
  {
    id: "12",
    title: "Data Science with Python",
    description: "Hands-on workshop covering pandas, matplotlib, and scikit-learn. Bring your laptop with Python installed.",
    date: "2026-03-15",
    time: "3:00 PM",
    location: "CS Lab, Building B",
    category: "Workshop",
    department: "Computer Science",
    organizer: "Data Science Club",
    attendees: 35,
    maxAttendees: 35,
    image: "",
    tags: ["Python", "Data", "Workshop"],
  },
];

export interface OrganizerStats {
  totalEvents: number;
  totalAttendees: number;
  upcomingEvents: number;
  avgAttendance: number;
}

export const organizerStats: OrganizerStats = {
  totalEvents: 12,
  totalAttendees: 1840,
  upcomingEvents: 8,
  avgAttendance: 78,
};
