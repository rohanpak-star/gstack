// 16-0: IPL perfect season sim — data layer
// Franchise `strength` is sim difficulty (not a realism claim), tuned so a
// well-drafted XI rates ~85-91 and most league games are winnable but never free.

const FRANCHISES = [
  // current
  { id: 'csk',  name: 'Chennai Super Kings',         short: 'CSK',  from: 2008, to: 2026, strength: 82, color: '#f9cd05', text: '#1a1a00' },
  { id: 'mi',   name: 'Mumbai Indians',              short: 'MI',   from: 2008, to: 2026, strength: 82, color: '#045093', text: '#ffffff' },
  { id: 'kkr',  name: 'Kolkata Knight Riders',       short: 'KKR',  from: 2008, to: 2026, strength: 80, color: '#3a225d', text: '#f2c029' },
  { id: 'gt',   name: 'Gujarat Titans',              short: 'GT',   from: 2022, to: 2026, strength: 80, color: '#1b2a4a', text: '#c9a227' },
  { id: 'rcb',  name: 'Royal Challengers Bengaluru', short: 'RCB',  from: 2008, to: 2026, strength: 79, color: '#d11a2d', text: '#ffffff' },
  { id: 'srh',  name: 'Sunrisers Hyderabad',         short: 'SRH',  from: 2013, to: 2026, strength: 79, color: '#f26522', text: '#1a1a1a' },
  { id: 'rr',   name: 'Rajasthan Royals',            short: 'RR',   from: 2008, to: 2026, strength: 78, color: '#ea1a8c', text: '#ffffff' },
  { id: 'dcap', name: 'Delhi Capitals',              short: 'DC',   from: 2019, to: 2026, strength: 77, color: '#17449b', text: '#ffffff' },
  { id: 'lsg',  name: 'Lucknow Super Giants',        short: 'LSG',  from: 2022, to: 2026, strength: 77, color: '#00b2a9', text: '#0a1a1a' },
  { id: 'pbks', name: 'Punjab Kings',                short: 'PBKS', from: 2021, to: 2026, strength: 76, color: '#dd1f2d', text: '#ffffff' },
  // retro identities + defunct
  { id: 'kxip', name: 'Kings XI Punjab',             short: 'KXIP', from: 2008, to: 2020, strength: 75, color: '#b21f2d', text: '#d9c87c' },
  { id: 'dd',   name: 'Delhi Daredevils',            short: 'DD',   from: 2008, to: 2018, strength: 75, color: '#1c4595', text: '#ef1b23' },
  { id: 'rps',  name: 'Rising Pune Supergiant',      short: 'RPS',  from: 2016, to: 2017, strength: 74, color: '#5b2d8e', text: '#ffffff' },
  { id: 'dch',  name: 'Deccan Chargers',             short: 'DCH',  from: 2008, to: 2012, strength: 73, color: '#1f2a44', text: '#c0c0c0' },
  { id: 'gl',   name: 'Gujarat Lions',               short: 'GL',   from: 2016, to: 2017, strength: 73, color: '#e8590c', text: '#ffffff' },
  { id: 'pwi',  name: 'Pune Warriors India',         short: 'PWI',  from: 2011, to: 2013, strength: 70, color: '#2e9bd6', text: '#0a0a0a' },
  { id: 'ktk',  name: 'Kochi Tuskers Kerala',        short: 'KTK',  from: 2011, to: 2011, strength: 68, color: '#5d3a8e', text: '#f47e20' },
];

// Boss teams: opponents only, never spinnable.
const BOSS_TEAMS = [
  { id: 'legends', name: 'IPL Legends XI',      short: 'LEG', strength: 85, color: '#c9a227', text: '#1a1a00', boss: true },
  { id: 'world',   name: 'World T20 All-Stars', short: 'WLD', strength: 84, color: '#0f6b4f', text: '#ffffff', boss: true },
];

// P(name, role, overseas, bat, bowl, from, to, teams)
// role: WK | BAT | AR | BOWL. Ratings 1-99. from/to = IPL career span.
function P(name, role, os, bat, bowl, from, to, teams) {
  return { name, role, os, bat, bowl, from, to, teams };
}

const PLAYERS = [
  // ---- CSK core ----
  P('MS Dhoni', 'WK', 0, 88, 5, 2008, 2025, ['csk', 'rps']),
  P('Suresh Raina', 'BAT', 0, 86, 45, 2008, 2021, ['csk', 'gl']),
  P('Ravindra Jadeja', 'AR', 0, 78, 86, 2008, 2025, ['rr', 'ktk', 'csk', 'gl']),
  P('Ravichandran Ashwin', 'BOWL', 0, 48, 88, 2009, 2025, ['csk', 'rps', 'kxip', 'dcap', 'rr']),
  P('Dwayne Bravo', 'AR', 1, 70, 87, 2008, 2021, ['mi', 'csk', 'gl']),
  P('Michael Hussey', 'BAT', 1, 86, 15, 2008, 2015, ['csk', 'mi']),
  P('Matthew Hayden', 'BAT', 1, 84, 0, 2008, 2010, ['csk']),
  P('Faf du Plessis', 'BAT', 1, 87, 10, 2012, 2025, ['csk', 'rps', 'rcb']),
  P('Shane Watson', 'AR', 1, 84, 78, 2008, 2020, ['rr', 'rps', 'csk']),
  P('Ruturaj Gaikwad', 'BAT', 0, 87, 5, 2020, 2025, ['csk']),
  P('Devon Conway', 'WK', 1, 85, 0, 2021, 2025, ['csk']),
  P('Ajinkya Rahane', 'BAT', 0, 80, 5, 2008, 2025, ['mi', 'rr', 'rps', 'dcap', 'kkr', 'csk']),
  P('Moeen Ali', 'AR', 1, 76, 78, 2018, 2024, ['rcb', 'csk']),
  P('Deepak Chahar', 'BOWL', 0, 35, 82, 2016, 2025, ['rps', 'csk', 'mi']),
  P('Matheesha Pathirana', 'BOWL', 1, 10, 86, 2022, 2025, ['csk']),
  P('Shivam Dube', 'AR', 0, 80, 50, 2019, 2025, ['rcb', 'csk']),
  P('Sam Curran', 'AR', 1, 72, 79, 2019, 2025, ['kxip', 'csk', 'pbks']),
  P('Ben Stokes', 'AR', 1, 80, 76, 2017, 2023, ['rps', 'rr', 'csk']),
  P('Ambati Rayudu', 'BAT', 0, 78, 5, 2010, 2023, ['mi', 'csk']),
  P('Piyush Chawla', 'BOWL', 0, 40, 79, 2008, 2024, ['kxip', 'kkr', 'csk', 'mi']),
  P('Imran Tahir', 'BOWL', 1, 5, 87, 2014, 2021, ['dd', 'rps', 'csk']),
  P('Mohit Sharma', 'BOWL', 0, 25, 78, 2013, 2025, ['csk', 'kxip', 'dd', 'gt']),
  P('Murali Vijay', 'BAT', 0, 77, 10, 2009, 2020, ['csk', 'dd', 'kxip']),
  P('Albie Morkel', 'AR', 1, 70, 74, 2008, 2016, ['csk', 'dd']),
  P('Muttiah Muralitharan', 'BOWL', 1, 10, 86, 2008, 2014, ['csk', 'ktk', 'rcb']),
  P('Rachin Ravindra', 'AR', 1, 75, 55, 2024, 2025, ['csk']),
  P('Noor Ahmad', 'BOWL', 1, 5, 83, 2023, 2025, ['gt', 'csk']),
  P('Khaleel Ahmed', 'BOWL', 0, 5, 77, 2018, 2025, ['srh', 'dcap', 'csk']),
  P('Tim Southee', 'BOWL', 1, 25, 78, 2011, 2024, ['csk', 'rr', 'mi', 'rcb', 'kkr']),
  P('Josh Hazlewood', 'BOWL', 1, 10, 88, 2021, 2025, ['csk', 'rcb']),

  // ---- MI core ----
  P('Rohit Sharma', 'BAT', 0, 91, 25, 2008, 2025, ['dch', 'mi']),
  P('Jasprit Bumrah', 'BOWL', 0, 20, 98, 2013, 2025, ['mi']),
  P('Lasith Malinga', 'BOWL', 1, 10, 96, 2008, 2019, ['mi']),
  P('Kieron Pollard', 'AR', 1, 84, 70, 2010, 2022, ['mi']),
  P('Hardik Pandya', 'AR', 0, 83, 78, 2015, 2025, ['mi', 'gt']),
  P('Krunal Pandya', 'AR', 0, 70, 76, 2016, 2025, ['mi', 'lsg', 'rcb']),
  P('Suryakumar Yadav', 'BAT', 0, 94, 5, 2012, 2025, ['mi', 'kkr']),
  P('Ishan Kishan', 'WK', 0, 82, 0, 2016, 2025, ['gl', 'mi', 'srh']),
  P('Quinton de Kock', 'WK', 1, 87, 0, 2013, 2025, ['srh', 'dd', 'rcb', 'mi', 'lsg', 'kkr']),
  P('Sachin Tendulkar', 'BAT', 0, 88, 20, 2008, 2013, ['mi']),
  P('Sanath Jayasuriya', 'AR', 1, 85, 55, 2008, 2010, ['mi']),
  P('Harbhajan Singh', 'BOWL', 0, 45, 84, 2008, 2021, ['mi', 'csk', 'kkr']),
  P('Trent Boult', 'BOWL', 1, 10, 89, 2017, 2025, ['srh', 'dd', 'mi', 'rr']),
  P('Mitchell McClenaghan', 'BOWL', 1, 10, 80, 2015, 2020, ['mi']),
  P('Tilak Varma', 'BAT', 0, 84, 10, 2022, 2025, ['mi']),
  P('Tim David', 'BAT', 1, 83, 0, 2022, 2025, ['mi', 'rcb']),
  P('Jos Buttler', 'WK', 1, 93, 0, 2016, 2025, ['mi', 'rr', 'gt']),
  P('Nathan Coulter-Nile', 'BOWL', 1, 35, 79, 2013, 2021, ['mi', 'kkr', 'rcb', 'dd']),
  P('Zaheer Khan', 'BOWL', 0, 20, 85, 2008, 2017, ['mi', 'rcb', 'dd']),
  P('Rahul Chahar', 'BOWL', 0, 10, 77, 2018, 2025, ['mi', 'pbks']),
  P('Mitchell Johnson', 'BOWL', 1, 30, 84, 2013, 2017, ['mi', 'kxip']),
  P('Cameron Green', 'AR', 1, 78, 74, 2023, 2024, ['mi', 'rcb']),
  P('Dhawal Kulkarni', 'BOWL', 0, 10, 74, 2008, 2020, ['mi', 'rr', 'gl']),
  P('Saurabh Tiwary', 'BAT', 0, 68, 0, 2008, 2021, ['mi', 'rcb', 'dd']),

  // ---- RCB core ----
  P('Virat Kohli', 'BAT', 0, 95, 10, 2008, 2025, ['rcb']),
  P('AB de Villiers', 'WK', 1, 96, 0, 2008, 2021, ['dd', 'rcb']),
  P('Chris Gayle', 'BAT', 1, 94, 45, 2008, 2021, ['kkr', 'rcb', 'kxip', 'pbks']),
  P('Glenn Maxwell', 'AR', 1, 84, 65, 2012, 2025, ['dd', 'mi', 'kxip', 'rcb', 'pbks']),
  P('Yuzvendra Chahal', 'BOWL', 0, 5, 88, 2011, 2025, ['mi', 'rcb', 'rr', 'pbks']),
  P('Mohammed Siraj', 'BOWL', 0, 10, 85, 2017, 2025, ['srh', 'rcb', 'gt']),
  P('Mitchell Starc', 'BOWL', 1, 30, 88, 2014, 2025, ['rcb', 'kkr', 'dcap']),
  P('Rajat Patidar', 'BAT', 0, 83, 0, 2021, 2025, ['rcb']),
  P('Dinesh Karthik', 'WK', 0, 79, 0, 2008, 2024, ['dd', 'kxip', 'mi', 'gl', 'kkr', 'rcb']),
  P('Phil Salt', 'WK', 1, 86, 0, 2023, 2025, ['dcap', 'kkr', 'rcb']),
  P('Devdutt Padikkal', 'BAT', 0, 76, 0, 2020, 2025, ['rcb', 'rr', 'lsg']),
  P('Harshal Patel', 'BOWL', 0, 35, 82, 2012, 2025, ['rcb', 'dd', 'dcap', 'pbks', 'srh']),
  P('Anil Kumble', 'BOWL', 0, 25, 84, 2008, 2010, ['rcb']),
  P('Kevin Pietersen', 'BAT', 1, 83, 20, 2009, 2016, ['rcb', 'dd']),
  P('Rahul Dravid', 'BAT', 0, 79, 0, 2008, 2013, ['rcb', 'rr']),
  P('Wanindu Hasaranga', 'BOWL', 1, 40, 84, 2021, 2025, ['rcb', 'srh', 'rr']),
  P('Liam Livingstone', 'AR', 1, 82, 60, 2019, 2025, ['rr', 'pbks', 'rcb']),
  P('Jitesh Sharma', 'WK', 0, 76, 0, 2022, 2025, ['pbks', 'rcb']),

  // ---- KKR core ----
  P('Gautam Gambhir', 'BAT', 0, 84, 0, 2008, 2018, ['dd', 'kkr']),
  P('Sunil Narine', 'AR', 1, 65, 93, 2012, 2025, ['kkr']),
  P('Andre Russell', 'AR', 1, 88, 80, 2012, 2025, ['dd', 'kkr']),
  P('Shreyas Iyer', 'BAT', 0, 86, 0, 2015, 2025, ['dd', 'dcap', 'kkr', 'pbks']),
  P('Nitish Rana', 'BAT', 0, 76, 25, 2016, 2025, ['mi', 'kkr', 'rr']),
  P('Pat Cummins', 'AR', 1, 60, 88, 2014, 2025, ['kkr', 'dd', 'srh']),
  P('Rinku Singh', 'BAT', 0, 81, 0, 2018, 2025, ['kkr']),
  P('Varun Chakravarthy', 'BOWL', 0, 5, 88, 2019, 2025, ['kxip', 'kkr']),
  P('Jacques Kallis', 'AR', 1, 80, 76, 2008, 2014, ['rcb', 'kkr']),
  P('Brendon McCullum', 'WK', 1, 84, 0, 2008, 2017, ['kkr', 'ktk', 'csk', 'gl']),
  P('Shubman Gill', 'BAT', 0, 89, 0, 2018, 2025, ['kkr', 'gt']),
  P('Venkatesh Iyer', 'AR', 0, 78, 50, 2021, 2025, ['kkr']),
  P('Robin Uthappa', 'WK', 0, 80, 0, 2008, 2022, ['mi', 'rcb', 'pwi', 'kkr', 'rr', 'csk']),
  P('Kuldeep Yadav', 'BOWL', 0, 15, 86, 2014, 2025, ['kkr', 'dcap']),
  P('Wriddhiman Saha', 'WK', 0, 74, 0, 2008, 2023, ['kkr', 'csk', 'kxip', 'srh', 'gt']),
  P('Yusuf Pathan', 'AR', 0, 78, 60, 2008, 2021, ['rr', 'kkr', 'srh']),
  P('Umesh Yadav', 'BOWL', 0, 10, 79, 2010, 2024, ['dd', 'kkr', 'rcb', 'gt']),
  P('Lockie Ferguson', 'BOWL', 1, 5, 84, 2017, 2025, ['rps', 'kkr', 'gt']),
  P('Morne Morkel', 'BOWL', 1, 10, 82, 2008, 2016, ['dd', 'kkr']),
  P('Anrich Nortje', 'BOWL', 1, 10, 84, 2020, 2025, ['dcap', 'kkr']),

  // ---- SRH core ----
  P('David Warner', 'BAT', 1, 93, 0, 2009, 2025, ['dd', 'srh', 'dcap']),
  P('Bhuvneshwar Kumar', 'BOWL', 0, 35, 86, 2011, 2025, ['pwi', 'srh', 'rcb']),
  P('Rashid Khan', 'BOWL', 1, 55, 96, 2017, 2025, ['srh', 'gt']),
  P('Kane Williamson', 'BAT', 1, 84, 5, 2015, 2024, ['srh', 'gt']),
  P('Travis Head', 'BAT', 1, 90, 15, 2016, 2025, ['rcb', 'srh']),
  P('Heinrich Klaasen', 'WK', 1, 91, 0, 2018, 2025, ['rr', 'srh']),
  P('Abhishek Sharma', 'AR', 0, 87, 40, 2018, 2025, ['dd', 'srh']),
  P('T Natarajan', 'BOWL', 0, 5, 80, 2017, 2025, ['kxip', 'srh', 'dcap']),
  P('Shikhar Dhawan', 'BAT', 0, 85, 0, 2008, 2024, ['dd', 'mi', 'dch', 'srh', 'dcap', 'pbks']),
  P('Mohammed Shami', 'BOWL', 0, 15, 86, 2011, 2025, ['kkr', 'dd', 'kxip', 'pbks', 'gt', 'srh']),
  P('Dale Steyn', 'BOWL', 1, 15, 90, 2008, 2020, ['rcb', 'dch', 'srh']),
  P('Umran Malik', 'BOWL', 0, 5, 78, 2021, 2024, ['srh']),
  P('Nitish Kumar Reddy', 'AR', 0, 74, 65, 2024, 2025, ['srh']),
  P('Rahul Tripathi', 'BAT', 0, 78, 5, 2017, 2025, ['rps', 'rr', 'kkr', 'srh', 'csk']),
  P('Jason Roy', 'BAT', 1, 84, 0, 2017, 2023, ['gl', 'dd', 'srh', 'kkr']),
  P('Marco Jansen', 'AR', 1, 50, 80, 2021, 2025, ['mi', 'srh', 'pbks']),
  P('Jonny Bairstow', 'WK', 1, 84, 0, 2019, 2023, ['srh', 'pbks']),

  // ---- RR core ----
  P('Shane Warne', 'BOWL', 1, 40, 90, 2008, 2011, ['rr']),
  P('Sanju Samson', 'WK', 0, 86, 0, 2013, 2025, ['rr', 'dd']),
  P('Jofra Archer', 'BOWL', 1, 45, 90, 2018, 2025, ['rr', 'mi', 'rcb']),
  P('Yashasvi Jaiswal', 'BAT', 0, 88, 0, 2020, 2025, ['rr']),
  P('Riyan Parag', 'BAT', 0, 78, 30, 2019, 2025, ['rr']),
  P('Steve Smith', 'BAT', 1, 83, 10, 2012, 2021, ['pwi', 'rr', 'rps', 'dcap']),
  P('Rahul Tewatia', 'AR', 0, 72, 65, 2014, 2025, ['rr', 'kxip', 'dd', 'gt']),
  P('James Faulkner', 'AR', 1, 65, 80, 2013, 2017, ['rr', 'gl']),
  P('Shimron Hetmyer', 'BAT', 1, 82, 0, 2019, 2025, ['rcb', 'dcap', 'rr']),
  P('Sandeep Sharma', 'BOWL', 0, 5, 79, 2013, 2025, ['kxip', 'srh', 'rr']),
  P('Dhruv Jurel', 'WK', 0, 78, 0, 2023, 2025, ['rr']),
  P('Chris Morris', 'AR', 1, 68, 82, 2013, 2021, ['csk', 'dd', 'dcap', 'rcb', 'rr']),
  P('Munaf Patel', 'BOWL', 0, 5, 76, 2008, 2017, ['rr', 'mi', 'gl']),
  P('Adam Zampa', 'BOWL', 1, 10, 82, 2016, 2025, ['rps', 'rcb', 'rr']),
  P('Brad Hodge', 'BAT', 1, 78, 15, 2008, 2015, ['kkr', 'ktk', 'rr']),
  P('Avesh Khan', 'BOWL', 0, 5, 79, 2017, 2025, ['dd', 'dcap', 'lsg', 'rr']),

  // ---- GT core ----
  P('Sai Sudharsan', 'BAT', 0, 86, 0, 2022, 2025, ['gt']),
  P('Sai Kishore', 'BOWL', 0, 20, 76, 2022, 2025, ['gt']),
  P('David Miller', 'BAT', 1, 84, 0, 2012, 2025, ['kxip', 'pbks', 'rr', 'gt', 'lsg']),
  P('Matthew Wade', 'WK', 1, 76, 0, 2011, 2023, ['dd', 'gt']),
  P('Washington Sundar', 'AR', 0, 65, 76, 2017, 2025, ['rps', 'rcb', 'srh', 'gt']),

  // ---- LSG core ----
  P('KL Rahul', 'WK', 0, 89, 0, 2013, 2025, ['rcb', 'srh', 'kxip', 'lsg', 'dcap']),
  P('Nicholas Pooran', 'WK', 1, 88, 0, 2019, 2025, ['kxip', 'pbks', 'srh', 'lsg']),
  P('Marcus Stoinis', 'AR', 1, 78, 68, 2015, 2025, ['kxip', 'rps', 'dcap', 'lsg', 'pbks']),
  P('Ravi Bishnoi', 'BOWL', 0, 5, 81, 2020, 2025, ['kxip', 'pbks', 'lsg']),
  P('Mayank Yadav', 'BOWL', 0, 5, 80, 2024, 2025, ['lsg']),
  P('Mitchell Marsh', 'AR', 1, 82, 70, 2011, 2025, ['pwi', 'rps', 'dcap', 'lsg']),
  P('Deepak Hooda', 'AR', 0, 70, 45, 2016, 2025, ['rr', 'srh', 'pbks', 'lsg']),

  // ---- DC (Capitals) core ----
  P('Rishabh Pant', 'WK', 0, 88, 0, 2016, 2025, ['dd', 'dcap', 'lsg']),
  P('Axar Patel', 'AR', 0, 68, 82, 2013, 2025, ['mi', 'kxip', 'dcap']),
  P('Kagiso Rabada', 'BOWL', 1, 20, 89, 2017, 2025, ['dd', 'dcap', 'pbks', 'gt']),
  P('Prithvi Shaw', 'BAT', 0, 77, 0, 2018, 2024, ['dd', 'dcap']),
  P('Jake Fraser-McGurk', 'BAT', 1, 82, 0, 2024, 2025, ['dcap']),

  // ---- PBKS core ----
  P('Arshdeep Singh', 'BOWL', 0, 10, 83, 2019, 2025, ['kxip', 'pbks']),
  P('Prabhsimran Singh', 'WK', 0, 77, 0, 2019, 2025, ['kxip', 'pbks']),
  P('Shashank Singh', 'BAT', 0, 75, 10, 2022, 2025, ['pbks']),

  // ---- KXIP-era ----
  P('Virender Sehwag', 'BAT', 0, 87, 25, 2008, 2015, ['dd', 'kxip']),
  P('Yuvraj Singh', 'AR', 0, 83, 60, 2008, 2019, ['kxip', 'pwi', 'rcb', 'dd', 'srh', 'mi']),
  P('Adam Gilchrist', 'WK', 1, 88, 0, 2008, 2013, ['dch', 'kxip']),
  P('Kumar Sangakkara', 'WK', 1, 82, 0, 2008, 2013, ['kxip', 'dch', 'srh']),
  P('Mahela Jayawardene', 'BAT', 1, 80, 0, 2008, 2014, ['kxip', 'ktk', 'dd']),
  P('Shaun Marsh', 'BAT', 1, 82, 0, 2008, 2017, ['kxip']),
  P('Mayank Agarwal', 'BAT', 0, 78, 0, 2011, 2025, ['rcb', 'dd', 'rps', 'kxip', 'pbks', 'srh']),
  P('Sreesanth', 'BOWL', 0, 5, 75, 2008, 2013, ['kxip', 'ktk', 'rr']),
  P('Irfan Pathan', 'AR', 0, 65, 72, 2008, 2017, ['kxip', 'dd', 'srh']),
  P('Andrew Tye', 'BOWL', 1, 10, 78, 2017, 2022, ['gl', 'kxip', 'rr']),
  P('Praveen Kumar', 'BOWL', 0, 30, 79, 2008, 2017, ['rcb', 'kxip', 'mi', 'srh', 'gl']),

  // ---- DD-era ----
  P('Ashish Nehra', 'BOWL', 0, 5, 81, 2008, 2017, ['dd', 'mi', 'pwi', 'csk', 'srh']),
  P('Amit Mishra', 'BOWL', 0, 30, 83, 2008, 2023, ['dd', 'dch', 'srh', 'lsg']),
  P('JP Duminy', 'AR', 1, 76, 50, 2009, 2019, ['mi', 'dd']),
  P('Manoj Tiwary', 'BAT', 0, 72, 10, 2008, 2018, ['dd', 'kkr', 'rps', 'kxip']),
  P('Jesse Ryder', 'BAT', 1, 74, 25, 2009, 2014, ['rcb', 'pwi', 'dd']),
  P('Wayne Parnell', 'BOWL', 1, 35, 74, 2009, 2017, ['dd', 'pwi']),
  P('Angelo Mathews', 'AR', 1, 70, 74, 2009, 2017, ['kkr', 'pwi', 'dd']),
  P('Rahul Sharma', 'BOWL', 0, 5, 72, 2011, 2014, ['pwi', 'dd']),

  // ---- DCH-era ----
  P('Herschelle Gibbs', 'BAT', 1, 79, 0, 2008, 2012, ['dch']),
  P('Andrew Symonds', 'AR', 1, 81, 65, 2008, 2011, ['dch', 'mi']),
  P('Pragyan Ojha', 'BOWL', 0, 5, 78, 2008, 2015, ['dch', 'mi']),
  P('Ishant Sharma', 'BOWL', 0, 5, 76, 2008, 2024, ['kkr', 'dch', 'srh', 'kxip', 'dd', 'dcap', 'gt']),
  P('Cameron White', 'BAT', 1, 76, 15, 2009, 2014, ['rcb', 'dch', 'srh']),
  P('Y Venugopal Rao', 'BAT', 0, 60, 20, 2008, 2012, ['dch']),
  P('Dwaraka Ravi Teja', 'BAT', 0, 56, 15, 2008, 2012, ['dch']),
  P('RP Singh', 'BOWL', 0, 5, 79, 2008, 2013, ['dch', 'ktk', 'mi']),
  P('Dwayne Smith', 'BAT', 1, 79, 40, 2008, 2017, ['dch', 'mi', 'csk', 'gl']),
  P('Parthiv Patel', 'WK', 0, 72, 0, 2008, 2020, ['csk', 'ktk', 'dch', 'srh', 'mi', 'rcb']),

  // ---- PWI-era ----
  P('Sourav Ganguly', 'BAT', 0, 76, 40, 2008, 2012, ['kkr', 'pwi']),
  P('Michael Clarke', 'BAT', 1, 72, 25, 2012, 2012, ['pwi']),
  P('Aaron Finch', 'BAT', 1, 81, 5, 2011, 2022, ['pwi', 'srh', 'mi', 'gl', 'kxip', 'kkr', 'rcb']),
  P('Ashok Dinda', 'BOWL', 0, 5, 74, 2008, 2018, ['kkr', 'pwi', 'rps']),
  P('Murali Kartik', 'BOWL', 0, 25, 74, 2008, 2014, ['kkr', 'kxip', 'pwi', 'rcb']),
  P('Mithun Manhas', 'BAT', 0, 60, 0, 2008, 2015, ['dd', 'pwi', 'csk']),
  P('Manish Pandey', 'BAT', 0, 77, 0, 2008, 2025, ['rcb', 'pwi', 'kkr', 'srh', 'lsg', 'dcap']),

  // ---- KTK-era ----
  P('VVS Laxman', 'BAT', 0, 68, 0, 2008, 2011, ['dch', 'ktk']),
  P('Roelof van der Merwe', 'AR', 1, 50, 72, 2009, 2011, ['rcb', 'ktk']),
  P('Vinay Kumar', 'BOWL', 0, 20, 76, 2008, 2018, ['rcb', 'ktk', 'mi', 'kkr']),
  P('Jacob Oram', 'AR', 1, 60, 70, 2008, 2011, ['csk', 'ktk']),
  P('Prasanth Parameswaran', 'BOWL', 0, 5, 58, 2011, 2011, ['ktk']),

  // ---- misc multi-team ----
  P('Jaydev Unadkat', 'BOWL', 0, 25, 76, 2010, 2025, ['kkr', 'dd', 'rps', 'rr', 'lsg']),
];

const ERAS = [
  { id: 'all',  label: 'All-time (2008+)', start: 2008 },
  { id: 'e12',  label: 'Modern (2012+)',   start: 2012 },
  { id: 'e16',  label: 'Recent (2016+)',   start: 2016 },
  { id: 'e20',  label: 'Current (2020+)',  start: 2020 },
];

const DIFFICULTIES = [
  { id: 'easy',   label: 'Easy',   respins: 3, mult: 0.94, blurb: '3 re-spins, softer opponents' },
  { id: 'normal', label: 'Normal', respins: 1, mult: 1.00, blurb: '1 re-spin' },
  { id: 'hard',   label: 'Hard',   respins: 0, mult: 1.04, blurb: 'No re-spins, juiced opponents' },
];

if (typeof module !== 'undefined') {
  module.exports = { FRANCHISES, BOSS_TEAMS, PLAYERS, ERAS, DIFFICULTIES };
}
