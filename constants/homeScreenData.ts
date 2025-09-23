// Static image imports
const reunionWeekend = require('../assets/images/reunion_weekend.png');
const tennisAndLifeCamp = require('../assets/images/tennis_and_life_camp.png');
const researchPresentations = require('../assets/images/research_presentations.png');
const evelynYoung = require('../assets/images/evelyn_young_dining_room.png');
const steamery = require('../assets/images/steamery.png');
const courtyard = require('../assets/images/courtyard_caf.png');
const nearbyCafes = require('../assets/images/nearby_cafes.png');
const northHall = require('../assets/images/north_hall_renovation.png');
const diningSeating = require('../assets/images/dining_room_seating.png');
const websiteLaunch = require('../assets/images/new_website_launch.png');
const campusMap = require('../assets/images/campus_map.png');
const gusbus = require('../assets/images/gusbus.png');
const safetyInfo = require('../assets/images/safety_info.png');
const wellbeing = require('../assets/images/well-being.png');
const artsAndMusic = require('../assets/images/arts_and_music.png');
const athletics = require('../assets/images/athletics.png');

// This is going in the Campus Safety card
const CampusSafetyphoneNumbers = [
  { name: 'Campus Safety', number: '507-933-8888' },
  { name: 'Health Services', number: '507-933-6666' },
  { name: 'Counseling Services', number: '507-933-5555' },
  // CF Numbers
  { name: 'Arbor View, College View, Chapel View CF', number: '507-933-7000' },
  { name: 'Complex CF', number: '507-933-7001' },
  { name: 'Norelius CF', number: '507-933-7002' },
  { name: 'Sohre and Pittman CF', number: '507-933-7003' },
  { name: 'Prairie View, International Center, and Southwest CF', number: '507-933-7004' },
  { name: 'Rundstrom and Uhler CF', number: '507-933-7005' },
];

// This is going in the Campus Safety card
const HealthServicesPhoneNumbers = [
  { name: 'Health Services', number: '507-933-6666' },
  { name: 'Counseling Center', number: '507-933-5555' },  
  { name: 'Campus Safety', number: '507-933-8888' },
  { name: 'Dean of Students', number: '507-933-7520' },
  { name: 'Sexual Assault Response Team (SART)', number: '507-933-6200' },
  { name: '24-Hour Crisis Line', number: '1-800-422-4453' },
];

export default {
  featured: [
    {
      title: 'Alumni Reconnect at Gustavus Reunion Weekend',
      description: 'Hundreds of alumni returned to Gustavus Adolphus College for the annual Reunion Weekend, celebrating milestones with classmates, faculty, and friends. The campus buzzed with nostalgia as Gusties gathered for storytelling, tours, and celebration under the summer sun.',
      image: reunionWeekend,
      tags: ['alumni', 'events'],
    },
    {
      title: 'Tennis & Life Camp Inspires Growth On and Off the Court',
      description: 'Now in its 45th year, the Tennis & Life Camp at Gustavus blends expert athletic coaching with life philosophy sessions. This summer’s session focused on resilience, sportsmanship, and personal development, drawing campers from across the Midwest.',
      image: tennisAndLifeCamp,
      tags: ['sports', 'camp'],
    },
    {
      title: 'Gustavus Students Shine in Spring Research Symposium',
      description: 'Dozens of Gustavus students presented their original research projects this spring, showcasing academic rigor in topics ranging from climate science to political philosophy. The annual event underscores the college’s commitment to undergraduate research excellence.',
      image: researchPresentations,
      tags: ['academics', 'research'],
    },
  ],
  dining: [
    {
      title: 'Evelyn Young Dining Room',
      description: 'The heart of student dining at Gustavus, Evelyn Young Dining Room offers nutritious meals, themed nights, and a warm community atmosphere.',
      image: evelynYoung,
      menu: 'https://www.gustavus.edu/dining/evelyn-young-dining-room',
      tags: ['dining', 'cafeteria'],
    },
    {
      title: 'Steamery',
      description: 'A popular campus eatery for fast, fresh food and student-friendly vibes, the Steamery continues to be a favorite stop between classes.',
      image: steamery,
      menu: 'https://www.gustavus.edu/dining/steamery',
      tags: ['dining', 'fast food'],
    },
    {
      title: 'Courtyard Café',
      description: 'Located in the lower level of the Campus Center, Courtyard Café offers coffee, smoothies, and cozy spaces for studying and socializing.',
      image: courtyard,
      menu: 'https://www.gustavus.edu/dining/courtyard-cafe',
      tags: ['dining', 'cafe'],
    },
    {
      title: 'Local Coffee & Eats Near Gustavus',
      description: 'Explore nearby cafés and restaurants that offer a change of scenery and flavor just minutes from campus.',
      image: nearbyCafes,
      tags: ['dining', 'off-campus'],
    },
  ],
  news: [
    {
      title: 'North Hall Renovation Modernizes Academic Experience',
      description: 'Construction crews have begun major renovations to North Hall, promising upgraded classrooms, sustainability features, and collaborative student spaces. The project aligns with the college’s long-term campus revitalization plan.',
      image: northHall,
      tags: ['campus', 'infrastructure'],
    },
    {
      title: 'Dining Room Seating Redesigned for Comfort and Flow',
      description: 'Gustavus unveiled a revamped seating plan in the Evelyn Young Dining Room to enhance student experience, promote inclusivity, and reduce congestion during peak meal times.',
      image: diningSeating,
      tags: ['dining', 'facilities'],
    },
    {
      title: 'Gustavus Launches New Website with Student-Centered Design',
      description: 'The college has rolled out a redesigned website focused on accessibility, modern design, and seamless navigation for prospective students, faculty, and families.',
      image: websiteLaunch,
      tags: ['tech', 'campus news'],
    },
  ],
  explore: [
    {
      title: 'Campus Map',
      description: 'Navigate Gustavus with ease using the latest interactive campus map, complete with building details, walking paths, and accessibility routes.',
      image: campusMap,
      link: 'https://gustavus.edu/maps/',
      tags: ['navigation', 'campus'],
    },
    {
      title: 'Ride the GusBus',
      description: 'The GusBus shuttle offers students and staff free transport between key campus locations and nearby stops, reducing parking stress and carbon impact.',
      info: '\n Hours of operation: Friday and Saturday 9PM - 2AM, dial (888) 880-4696 for a ride from designated pickup and drop off locations: \n\n Arborview Apartments \n Chapelview Apartments \n Collegeview Apartments \n Southwest Hall, \n 3 Flags Turnaround \n International Center \n 5th Street & Jefferson Avenue \n 7th Street & Jefferson Avenue \n 3rd Street & Nassau Avenue',
      image: gusbus,
      tags: ['transportation', 'campus life'],
    },
    {
      title: 'Campus Safety Resources Every Gustie Should Know',
      description: 'Gustavus provides robust safety services including 24/7 security patrols, blue light stations, and Safe Walk programs to keep the community secure.',
      CampusSafetyphoneNumbers,
      image: safetyInfo,
      
      tags: ['safety', 'resources'],
    },
    {
      title: 'Well-being at Gustavus',
      description: 'Mental and physical wellness are top priorities at Gustavus. Learn about campus health services, counseling, and stress relief events.',
      image: wellbeing,
      HealthServicesPhoneNumbers,
      tags: ['wellness', 'health'],
    },
    {
      title: 'Arts & Music at GAC: A Creative Legacy',
      description: 'From student concerts to professional exhibits, Gustavus fosters artistic expression in music, theatre, and visual arts.',
      image: artsAndMusic,
      link: 'https://gustavus.edu/arts/',
      tags: ['arts', 'music'],
    },
    {
      title: 'Gustavus Athletics: Go Gusties!',
      description: 'From MIAC championships to intramural leagues, Gustavus Athletics provides opportunities for competition, teamwork, and school pride.',
      image: athletics,
      link : 'https://gogusties.com/', 
      tags: ['sports', 'fitness'],
    },
  ],
};
