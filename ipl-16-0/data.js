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
  P('MS Dhoni', 'WK', 0, 88, 5, 2008, 2025, [{ id: 'csk', from: 2008, to: 2015 }, { id: 'rps', from: 2016, to: 2017 }, { id: 'csk', from: 2018, to: 2025 }]),
  P('Suresh Raina', 'BAT', 0, 86, 45, 2008, 2021, [{ id: 'csk', from: 2008, to: 2015 }, { id: 'gl', from: 2016, to: 2017 }, { id: 'csk', from: 2018, to: 2021 }]),
  P('Ravindra Jadeja', 'AR', 0, 78, 86, 2008, 2025, [{ id: 'rr', from: 2008, to: 2010 }, { id: 'ktk', from: 2011, to: 2011 }, { id: 'csk', from: 2012, to: 2015 }, { id: 'gl', from: 2016, to: 2017 }, { id: 'csk', from: 2018, to: 2025 }]),
  P('Ravichandran Ashwin', 'BOWL', 0, 48, 88, 2009, 2025, [{ id: 'csk', from: 2009, to: 2015 }, { id: 'rps', from: 2016, to: 2017 }, { id: 'kxip', from: 2018, to: 2019 }, { id: 'dcap', from: 2020, to: 2021 }, { id: 'rr', from: 2022, to: 2025 }]),
  P('Dwayne Bravo', 'AR', 1, 70, 87, 2008, 2021, [{ id: 'mi', from: 2008, to: 2010 }, { id: 'csk', from: 2011, to: 2015 }, { id: 'gl', from: 2016, to: 2017 }, { id: 'csk', from: 2018, to: 2021 }]),
  P('Michael Hussey', 'BAT', 1, 86, 15, 2008, 2015, [{ id: 'csk', from: 2008, to: 2011 }, { id: 'mi', from: 2012, to: 2015 }]),
  P('Matthew Hayden', 'BAT', 1, 84, 0, 2008, 2010, [{ id: 'csk', from: 2008, to: 2010 }]),
  P('Faf du Plessis', 'BAT', 1, 87, 10, 2012, 2025, [{ id: 'csk', from: 2012, to: 2015 }, { id: 'rps', from: 2016, to: 2017 }, { id: 'rcb', from: 2018, to: 2025 }]),
  P('Shane Watson', 'AR', 1, 84, 78, 2008, 2020, [{ id: 'rr', from: 2008, to: 2015 }, { id: 'rps', from: 2016, to: 2017 }, { id: 'csk', from: 2018, to: 2020 }]),
  P('Ruturaj Gaikwad', 'BAT', 0, 87, 5, 2020, 2025, [{ id: 'csk', from: 2020, to: 2025 }]),
  P('Devon Conway', 'WK', 1, 85, 0, 2021, 2025, [{ id: 'csk', from: 2021, to: 2025 }]),
  P('Ajinkya Rahane', 'BAT', 0, 80, 5, 2008, 2025, [{ id: 'mi', from: 2008, to: 2010 }, { id: 'rr', from: 2011, to: 2013 }, { id: 'rps', from: 2016, to: 2016 }, { id: 'dcap', from: 2019, to: 2019 }, { id: 'kkr', from: 2020, to: 2022 }, { id: 'csk', from: 2023, to: 2025 }]),
  P('Moeen Ali', 'AR', 1, 76, 78, 2018, 2024, [{ id: 'rcb', from: 2018, to: 2020 }, { id: 'csk', from: 2021, to: 2024 }]),
  P('Deepak Chahar', 'BOWL', 0, 35, 82, 2016, 2025, [{ id: 'rps', from: 2016, to: 2017 }, { id: 'csk', from: 2019, to: 2021 }, { id: 'mi', from: 2022, to: 2025 }]),
  P('Matheesha Pathirana', 'BOWL', 1, 10, 86, 2022, 2025, [{ id: 'csk', from: 2022, to: 2025 }]),
  P('Shivam Dube', 'AR', 0, 80, 50, 2019, 2025, [{ id: 'rcb', from: 2019, to: 2021 }, { id: 'csk', from: 2022, to: 2025 }]),
  P('Sam Curran', 'AR', 1, 72, 79, 2019, 2025, [{ id: 'kxip', from: 2019, to: 2020 }, { id: 'csk', from: 2021, to: 2022 }, { id: 'pbks', from: 2023, to: 2025 }]),
  P('Ben Stokes', 'AR', 1, 80, 76, 2017, 2023, [{ id: 'rps', from: 2017, to: 2017 }, { id: 'rr', from: 2019, to: 2020 }, { id: 'csk', from: 2021, to: 2023 }]),
  P('Ambati Rayudu', 'BAT', 0, 78, 5, 2010, 2023, [{ id: 'mi', from: 2010, to: 2016 }, { id: 'csk', from: 2017, to: 2023 }]),
  P('Piyush Chawla', 'BOWL', 0, 40, 79, 2008, 2024, [{ id: 'kxip', from: 2008, to: 2011 }, { id: 'kkr', from: 2012, to: 2015 }, { id: 'csk', from: 2016, to: 2019 }, { id: 'mi', from: 2020, to: 2024 }]),
  P('Imran Tahir', 'BOWL', 1, 5, 87, 2014, 2021, [{ id: 'dd', from: 2014, to: 2015 }, { id: 'rps', from: 2016, to: 2017 }, { id: 'csk', from: 2019, to: 2021 }]),
  P('Mohit Sharma', 'BOWL', 0, 25, 78, 2013, 2025, [{ id: 'csk', from: 2013, to: 2015 }, { id: 'kxip', from: 2016, to: 2018 }, { id: 'gt', from: 2022, to: 2025 }]),
  P('Murali Vijay', 'BAT', 0, 77, 10, 2009, 2020, [{ id: 'csk', from: 2009, to: 2012 }, { id: 'dd', from: 2013, to: 2016 }, { id: 'kxip', from: 2017, to: 2020 }]),
  P('Albie Morkel', 'AR', 1, 70, 74, 2008, 2016, [{ id: 'csk', from: 2008, to: 2011 }, { id: 'dd', from: 2012, to: 2016 }]),
  P('Muttiah Muralitharan', 'BOWL', 1, 10, 86, 2008, 2014, [{ id: 'csk', from: 2008, to: 2009 }, { id: 'ktk', from: 2011, to: 2011 }, { id: 'rcb', from: 2012, to: 2014 }]),
  P('Rachin Ravindra', 'AR', 1, 75, 55, 2024, 2025, [{ id: 'csk', from: 2024, to: 2025 }]),
  P('Noor Ahmad', 'BOWL', 1, 5, 83, 2023, 2025, [{ id: 'gt', from: 2023, to: 2023 }, { id: 'csk', from: 2024, to: 2025 }]),
  P('Khaleel Ahmed', 'BOWL', 0, 5, 77, 2018, 2025, [{ id: 'srh', from: 2018, to: 2019 }, { id: 'dcap', from: 2020, to: 2022 }, { id: 'csk', from: 2023, to: 2025 }]),
  P('Tim Southee', 'BOWL', 1, 25, 78, 2011, 2024, [{ id: 'csk', from: 2011, to: 2012 }, { id: 'rr', from: 2013, to: 2015 }, { id: 'mi', from: 2016, to: 2018 }, { id: 'rcb', from: 2019, to: 2021 }, { id: 'kkr', from: 2022, to: 2024 }]),
  P('Josh Hazlewood', 'BOWL', 1, 10, 88, 2021, 2025, [{ id: 'csk', from: 2021, to: 2022 }, { id: 'rcb', from: 2023, to: 2025 }]),

  // ---- MI core ----
  P('Rohit Sharma', 'BAT', 0, 91, 25, 2008, 2025, [{ id: 'dch', from: 2008, to: 2012 }, { id: 'mi', from: 2017, to: 2025 }]),
  P('Jasprit Bumrah', 'BOWL', 0, 20, 98, 2013, 2025, [{ id: 'mi', from: 2013, to: 2025 }]),
  P('Lasith Malinga', 'BOWL', 1, 10, 96, 2008, 2019, [{ id: 'mi', from: 2008, to: 2019 }]),
  P('Kieron Pollard', 'AR', 1, 84, 70, 2010, 2022, [{ id: 'mi', from: 2010, to: 2022 }]),
  P('Hardik Pandya', 'AR', 0, 83, 78, 2015, 2025, [{ id: 'mi', from: 2015, to: 2019 }, { id: 'gt', from: 2022, to: 2025 }]),
  P('Krunal Pandya', 'AR', 0, 70, 76, 2016, 2025, [{ id: 'mi', from: 2016, to: 2018 }, { id: 'rcb', from: 2022, to: 2025 }]),
  P('Suryakumar Yadav', 'BAT', 0, 94, 5, 2012, 2025, [{ id: 'mi', from: 2012, to: 2018 }, { id: 'kkr', from: 2019, to: 2025 }]),
  P('Ishan Kishan', 'WK', 0, 82, 0, 2016, 2025, [{ id: 'gl', from: 2016, to: 2017 }, { id: 'mi', from: 2019, to: 2021 }, { id: 'srh', from: 2022, to: 2025 }]),
  P('Quinton de Kock', 'WK', 1, 87, 0, 2013, 2025, [{ id: 'srh', from: 2013, to: 2014 }, { id: 'dd', from: 2015, to: 2016 }, { id: 'rcb', from: 2017, to: 2018 }, { id: 'mi', from: 2019, to: 2020 }, { id: 'lsg', from: 2022, to: 2022 }, { id: 'kkr', from: 2023, to: 2025 }]),
  P('Sachin Tendulkar', 'BAT', 0, 88, 20, 2008, 2013, [{ id: 'mi', from: 2008, to: 2013 }]),
  P('Sanath Jayasuriya', 'AR', 1, 85, 55, 2008, 2010, [{ id: 'mi', from: 2008, to: 2010 }]),
  P('Harbhajan Singh', 'BOWL', 0, 45, 84, 2008, 2021, [{ id: 'mi', from: 2008, to: 2011 }, { id: 'csk', from: 2012, to: 2016 }, { id: 'kkr', from: 2017, to: 2021 }]),
  P('Trent Boult', 'BOWL', 1, 10, 89, 2017, 2025, [{ id: 'srh', from: 2017, to: 2018 }, { id: 'mi', from: 2021, to: 2022 }, { id: 'rr', from: 2023, to: 2025 }]),
  P('Mitchell McClenaghan', 'BOWL', 1, 10, 80, 2015, 2020, [{ id: 'mi', from: 2015, to: 2020 }]),
  P('Tilak Varma', 'BAT', 0, 84, 10, 2022, 2025, [{ id: 'mi', from: 2022, to: 2025 }]),
  P('Tim David', 'BAT', 1, 83, 0, 2022, 2025, [{ id: 'mi', from: 2022, to: 2023 }, { id: 'rcb', from: 2024, to: 2025 }]),
  P('Jos Buttler', 'WK', 1, 93, 0, 2016, 2025, [{ id: 'mi', from: 2016, to: 2018 }, { id: 'rr', from: 2019, to: 2021 }, { id: 'gt', from: 2022, to: 2025 }]),
  P('Nathan Coulter-Nile', 'BOWL', 1, 35, 79, 2013, 2021, [{ id: 'mi', from: 2013, to: 2014 }, { id: 'kkr', from: 2015, to: 2016 }, { id: 'rcb', from: 2017, to: 2018 }]),
  P('Zaheer Khan', 'BOWL', 0, 20, 85, 2008, 2017, [{ id: 'mi', from: 2008, to: 2010 }, { id: 'rcb', from: 2011, to: 2013 }, { id: 'dd', from: 2014, to: 2017 }]),
  P('Rahul Chahar', 'BOWL', 0, 10, 77, 2018, 2025, [{ id: 'mi', from: 2018, to: 2021 }, { id: 'pbks', from: 2022, to: 2025 }]),
  P('Mitchell Johnson', 'BOWL', 1, 30, 84, 2013, 2017, [{ id: 'mi', from: 2013, to: 2014 }, { id: 'kxip', from: 2015, to: 2017 }]),
  P('Cameron Green', 'AR', 1, 78, 74, 2023, 2024, [{ id: 'mi', from: 2023, to: 2023 }, { id: 'rcb', from: 2024, to: 2024 }]),
  P('Dhawal Kulkarni', 'BOWL', 0, 10, 74, 2008, 2020, [{ id: 'mi', from: 2008, to: 2011 }, { id: 'rr', from: 2012, to: 2015 }, { id: 'gl', from: 2016, to: 2017 }]),
  P('Saurabh Tiwary', 'BAT', 0, 68, 0, 2008, 2021, [{ id: 'mi', from: 2008, to: 2011 }, { id: 'rcb', from: 2012, to: 2016 }, { id: 'dd', from: 2017, to: 2018 }]),

  // ---- RCB core ----
  P('Virat Kohli', 'BAT', 0, 95, 10, 2008, 2025, [{ id: 'rcb', from: 2008, to: 2025 }]),
  P('AB de Villiers', 'WK', 1, 96, 0, 2008, 2021, [{ id: 'dd', from: 2008, to: 2010 }, { id: 'rcb', from: 2011, to: 2021 }]),
  P('Chris Gayle', 'BAT', 1, 94, 45, 2008, 2021, [{ id: 'kkr', from: 2009, to: 2011 }, { id: 'rcb', from: 2012, to: 2017 }, { id: 'kxip', from: 2018, to: 2020 }, { id: 'pbks', from: 2021, to: 2021 }]),
  P('Glenn Maxwell', 'AR', 1, 84, 65, 2012, 2025, [{ id: 'dd', from: 2012, to: 2013 }, { id: 'mi', from: 2014, to: 2016 }, { id: 'kxip', from: 2017, to: 2019 }, { id: 'rcb', from: 2020, to: 2022 }, { id: 'pbks', from: 2023, to: 2025 }]),
  P('Yuzvendra Chahal', 'BOWL', 0, 5, 88, 2011, 2025, [{ id: 'mi', from: 2011, to: 2013 }, { id: 'rcb', from: 2014, to: 2017 }, { id: 'rr', from: 2018, to: 2021 }, { id: 'pbks', from: 2022, to: 2025 }]),
  P('Mohammed Siraj', 'BOWL', 0, 10, 85, 2017, 2025, [{ id: 'srh', from: 2017, to: 2019 }, { id: 'rcb', from: 2020, to: 2022 }, { id: 'gt', from: 2023, to: 2025 }]),
  P('Mitchell Starc', 'BOWL', 1, 30, 88, 2014, 2025, [{ id: 'rcb', from: 2014, to: 2017 }, { id: 'kkr', from: 2018, to: 2021 }, { id: 'dcap', from: 2022, to: 2025 }]),
  P('Rajat Patidar', 'BAT', 0, 83, 0, 2021, 2025, [{ id: 'rcb', from: 2021, to: 2025 }]),
  P('Dinesh Karthik', 'WK', 0, 79, 0, 2008, 2024, [{ id: 'dd', from: 2008, to: 2009 }, { id: 'kxip', from: 2010, to: 2012 }, { id: 'mi', from: 2013, to: 2015 }, { id: 'gl', from: 2016, to: 2017 }, { id: 'kkr', from: 2019, to: 2021 }, { id: 'rcb', from: 2022, to: 2024 }]),
  P('Phil Salt', 'WK', 1, 86, 0, 2023, 2025, [{ id: 'dcap', from: 2023, to: 2023 }, { id: 'kkr', from: 2024, to: 2024 }, { id: 'rcb', from: 2025, to: 2025 }]),
  P('Devdutt Padikkal', 'BAT', 0, 76, 0, 2020, 2025, [{ id: 'rcb', from: 2020, to: 2021 }, { id: 'rr', from: 2022, to: 2023 }, { id: 'lsg', from: 2024, to: 2025 }]),
  P('Harshal Patel', 'BOWL', 0, 35, 82, 2012, 2025, [{ id: 'rcb', from: 2012, to: 2013 }, { id: 'dd', from: 2014, to: 2016 }, { id: 'dcap', from: 2019, to: 2019 }, { id: 'pbks', from: 2021, to: 2022 }, { id: 'srh', from: 2023, to: 2025 }]),
  P('Anil Kumble', 'BOWL', 0, 25, 84, 2008, 2010, [{ id: 'rcb', from: 2008, to: 2010 }]),
  P('Kevin Pietersen', 'BAT', 1, 83, 20, 2009, 2016, [{ id: 'rcb', from: 2009, to: 2012 }, { id: 'dd', from: 2013, to: 2016 }]),
  P('Rahul Dravid', 'BAT', 0, 79, 0, 2008, 2013, [{ id: 'rcb', from: 2008, to: 2010 }, { id: 'rr', from: 2011, to: 2013 }]),
  P('Wanindu Hasaranga', 'BOWL', 1, 40, 84, 2021, 2025, [{ id: 'rcb', from: 2021, to: 2021 }, { id: 'srh', from: 2022, to: 2023 }, { id: 'rr', from: 2024, to: 2025 }]),
  P('Liam Livingstone', 'AR', 1, 82, 60, 2019, 2025, [{ id: 'rr', from: 2019, to: 2020 }, { id: 'pbks', from: 2021, to: 2022 }, { id: 'rcb', from: 2023, to: 2025 }]),
  P('Jitesh Sharma', 'WK', 0, 76, 0, 2022, 2025, [{ id: 'pbks', from: 2022, to: 2023 }, { id: 'rcb', from: 2024, to: 2025 }]),

  // ---- KKR core ----
  P('Gautam Gambhir', 'BAT', 0, 84, 0, 2008, 2018, [{ id: 'dd', from: 2008, to: 2012 }, { id: 'kkr', from: 2013, to: 2018 }]),
  P('Sunil Narine', 'AR', 1, 65, 93, 2012, 2025, [{ id: 'kkr', from: 2012, to: 2025 }]),
  P('Andre Russell', 'AR', 1, 88, 80, 2012, 2025, [{ id: 'dd', from: 2012, to: 2018 }, { id: 'kkr', from: 2019, to: 2025 }]),
  P('Shreyas Iyer', 'BAT', 0, 86, 0, 2015, 2025, [{ id: 'dd', from: 2015, to: 2016 }, { id: 'dcap', from: 2019, to: 2019 }, { id: 'kkr', from: 2020, to: 2022 }, { id: 'pbks', from: 2023, to: 2025 }]),
  P('Nitish Rana', 'BAT', 0, 76, 25, 2016, 2025, [{ id: 'mi', from: 2016, to: 2018 }, { id: 'kkr', from: 2019, to: 2021 }, { id: 'rr', from: 2022, to: 2025 }]),
  P('Pat Cummins', 'AR', 1, 60, 88, 2014, 2025, [{ id: 'kkr', from: 2014, to: 2017 }, { id: 'dd', from: 2018, to: 2018 }, { id: 'srh', from: 2022, to: 2025 }]),
  P('Rinku Singh', 'BAT', 0, 81, 0, 2018, 2025, [{ id: 'kkr', from: 2018, to: 2025 }]),
  P('Varun Chakravarthy', 'BOWL', 0, 5, 88, 2019, 2025, [{ id: 'kxip', from: 2019, to: 2020 }, { id: 'kkr', from: 2022, to: 2025 }]),
  P('Jacques Kallis', 'AR', 1, 80, 76, 2008, 2014, [{ id: 'rcb', from: 2008, to: 2010 }, { id: 'kkr', from: 2011, to: 2014 }]),
  P('Brendon McCullum', 'WK', 1, 84, 0, 2008, 2017, [{ id: 'kkr', from: 2008, to: 2009 }, { id: 'ktk', from: 2011, to: 2011 }, { id: 'csk', from: 2012, to: 2014 }, { id: 'gl', from: 2016, to: 2017 }]),
  P('Shubman Gill', 'BAT', 0, 89, 0, 2018, 2025, [{ id: 'kkr', from: 2018, to: 2021 }, { id: 'gt', from: 2022, to: 2025 }]),
  P('Venkatesh Iyer', 'AR', 0, 78, 50, 2021, 2025, [{ id: 'kkr', from: 2021, to: 2025 }]),
  P('Robin Uthappa', 'WK', 0, 80, 0, 2008, 2022, [{ id: 'mi', from: 2008, to: 2009 }, { id: 'rcb', from: 2010, to: 2011 }, { id: 'pwi', from: 2012, to: 2013 }, { id: 'kkr', from: 2014, to: 2016 }, { id: 'rr', from: 2017, to: 2019 }, { id: 'csk', from: 2020, to: 2022 }]),
  P('Kuldeep Yadav', 'BOWL', 0, 15, 86, 2014, 2025, [{ id: 'kkr', from: 2014, to: 2019 }, { id: 'dcap', from: 2020, to: 2025 }]),
  P('Wriddhiman Saha', 'WK', 0, 74, 0, 2008, 2023, [{ id: 'kkr', from: 2008, to: 2010 }, { id: 'csk', from: 2011, to: 2013 }, { id: 'kxip', from: 2014, to: 2016 }, { id: 'srh', from: 2017, to: 2019 }, { id: 'gt', from: 2022, to: 2023 }]),
  P('Yusuf Pathan', 'AR', 0, 78, 60, 2008, 2021, [{ id: 'rr', from: 2008, to: 2011 }, { id: 'kkr', from: 2012, to: 2016 }, { id: 'srh', from: 2017, to: 2021 }]),
  P('Umesh Yadav', 'BOWL', 0, 10, 79, 2010, 2024, [{ id: 'dd', from: 2010, to: 2012 }, { id: 'kkr', from: 2013, to: 2016 }, { id: 'rcb', from: 2017, to: 2020 }, { id: 'gt', from: 2022, to: 2024 }]),
  P('Lockie Ferguson', 'BOWL', 1, 5, 84, 2017, 2025, [{ id: 'rps', from: 2017, to: 2017 }, { id: 'kkr', from: 2020, to: 2022 }, { id: 'gt', from: 2023, to: 2025 }]),
  P('Morne Morkel', 'BOWL', 1, 10, 82, 2008, 2016, [{ id: 'dd', from: 2008, to: 2011 }, { id: 'kkr', from: 2012, to: 2016 }]),
  P('Anrich Nortje', 'BOWL', 1, 10, 84, 2020, 2025, [{ id: 'dcap', from: 2020, to: 2022 }, { id: 'kkr', from: 2023, to: 2025 }]),

  // ---- SRH core ----
  P('David Warner', 'BAT', 1, 93, 0, 2009, 2025, [{ id: 'dd', from: 2009, to: 2013 }, { id: 'srh', from: 2014, to: 2021 }, { id: 'dcap', from: 2022, to: 2025 }]),
  P('Bhuvneshwar Kumar', 'BOWL', 0, 35, 86, 2011, 2025, [{ id: 'pwi', from: 2011, to: 2013 }, { id: 'srh', from: 2016, to: 2020 }, { id: 'rcb', from: 2021, to: 2025 }]),
  P('Rashid Khan', 'BOWL', 1, 55, 96, 2017, 2025, [{ id: 'srh', from: 2017, to: 2020 }, { id: 'gt', from: 2022, to: 2025 }]),
  P('Kane Williamson', 'BAT', 1, 84, 5, 2015, 2024, [{ id: 'srh', from: 2015, to: 2019 }, { id: 'gt', from: 2022, to: 2024 }]),
  P('Travis Head', 'BAT', 1, 90, 15, 2016, 2025, [{ id: 'rcb', from: 2016, to: 2020 }, { id: 'srh', from: 2021, to: 2025 }]),
  P('Heinrich Klaasen', 'WK', 1, 91, 0, 2018, 2025, [{ id: 'rr', from: 2018, to: 2021 }, { id: 'srh', from: 2022, to: 2025 }]),
  P('Abhishek Sharma', 'AR', 0, 87, 40, 2018, 2025, [{ id: 'dd', from: 2018, to: 2018 }, { id: 'srh', from: 2022, to: 2025 }]),
  P('T Natarajan', 'BOWL', 0, 5, 80, 2017, 2025, [{ id: 'kxip', from: 2017, to: 2019 }, { id: 'srh', from: 2020, to: 2022 }, { id: 'dcap', from: 2023, to: 2025 }]),
  P('Shikhar Dhawan', 'BAT', 0, 85, 0, 2008, 2024, [{ id: 'dd', from: 2008, to: 2009 }, { id: 'mi', from: 2010, to: 2012 }, { id: 'srh', from: 2016, to: 2018 }, { id: 'dcap', from: 2019, to: 2021 }, { id: 'pbks', from: 2022, to: 2024 }]),
  P('Mohammed Shami', 'BOWL', 0, 15, 86, 2011, 2025, [{ id: 'kkr', from: 2011, to: 2012 }, { id: 'dd', from: 2013, to: 2014 }, { id: 'kxip', from: 2015, to: 2016 }, { id: 'gt', from: 2022, to: 2022 }, { id: 'srh', from: 2023, to: 2025 }]),
  P('Dale Steyn', 'BOWL', 1, 15, 90, 2008, 2020, [{ id: 'rcb', from: 2008, to: 2011 }, { id: 'dch', from: 2012, to: 2012 }, { id: 'srh', from: 2016, to: 2020 }]),
  P('Umran Malik', 'BOWL', 0, 5, 78, 2021, 2024, [{ id: 'srh', from: 2021, to: 2024 }]),
  P('Nitish Kumar Reddy', 'AR', 0, 74, 65, 2024, 2025, [{ id: 'srh', from: 2024, to: 2025 }]),
  P('Rahul Tripathi', 'BAT', 0, 78, 5, 2017, 2025, [{ id: 'rps', from: 2017, to: 2017 }, { id: 'rr', from: 2018, to: 2019 }, { id: 'kkr', from: 2020, to: 2021 }, { id: 'srh', from: 2022, to: 2023 }, { id: 'csk', from: 2024, to: 2025 }]),
  P('Jason Roy', 'BAT', 1, 84, 0, 2017, 2023, [{ id: 'gl', from: 2017, to: 2017 }, { id: 'dd', from: 2018, to: 2018 }, { id: 'srh', from: 2020, to: 2021 }, { id: 'kkr', from: 2022, to: 2023 }]),
  P('Marco Jansen', 'AR', 1, 50, 80, 2021, 2025, [{ id: 'mi', from: 2021, to: 2021 }, { id: 'srh', from: 2022, to: 2023 }, { id: 'pbks', from: 2024, to: 2025 }]),
  P('Jonny Bairstow', 'WK', 1, 84, 0, 2019, 2023, [{ id: 'srh', from: 2019, to: 2020 }, { id: 'pbks', from: 2021, to: 2023 }]),

  // ---- RR core ----
  P('Shane Warne', 'BOWL', 1, 40, 90, 2008, 2011, [{ id: 'rr', from: 2008, to: 2011 }]),
  P('Sanju Samson', 'WK', 0, 86, 0, 2013, 2025, [{ id: 'rr', from: 2013, to: 2018 }]),
  P('Jofra Archer', 'BOWL', 1, 45, 90, 2018, 2025, [{ id: 'rr', from: 2018, to: 2019 }, { id: 'mi', from: 2020, to: 2022 }, { id: 'rcb', from: 2023, to: 2025 }]),
  P('Yashasvi Jaiswal', 'BAT', 0, 88, 0, 2020, 2025, [{ id: 'rr', from: 2020, to: 2025 }]),
  P('Riyan Parag', 'BAT', 0, 78, 30, 2019, 2025, [{ id: 'rr', from: 2019, to: 2025 }]),
  P('Steve Smith', 'BAT', 1, 83, 10, 2012, 2021, [{ id: 'pwi', from: 2012, to: 2013 }, { id: 'rr', from: 2014, to: 2015 }, { id: 'rps', from: 2016, to: 2017 }, { id: 'dcap', from: 2019, to: 2021 }]),
  P('Rahul Tewatia', 'AR', 0, 72, 65, 2014, 2025, [{ id: 'rr', from: 2014, to: 2016 }, { id: 'kxip', from: 2017, to: 2019 }, { id: 'gt', from: 2023, to: 2025 }]),
  P('James Faulkner', 'AR', 1, 65, 80, 2013, 2017, [{ id: 'rr', from: 2013, to: 2014 }, { id: 'gl', from: 2016, to: 2017 }]),
  P('Shimron Hetmyer', 'BAT', 1, 82, 0, 2019, 2025, [{ id: 'rcb', from: 2019, to: 2020 }, { id: 'dcap', from: 2021, to: 2022 }, { id: 'rr', from: 2023, to: 2025 }]),
  P('Sandeep Sharma', 'BOWL', 0, 5, 79, 2013, 2025, [{ id: 'kxip', from: 2013, to: 2016 }, { id: 'srh', from: 2017, to: 2020 }, { id: 'rr', from: 2021, to: 2025 }]),
  P('Dhruv Jurel', 'WK', 0, 78, 0, 2023, 2025, [{ id: 'rr', from: 2023, to: 2025 }]),
  P('Chris Morris', 'AR', 1, 68, 82, 2013, 2021, [{ id: 'csk', from: 2013, to: 2013 }, { id: 'dd', from: 2014, to: 2015 }, { id: 'rcb', from: 2018, to: 2019 }, { id: 'rr', from: 2020, to: 2021 }]),
  P('Munaf Patel', 'BOWL', 0, 5, 76, 2008, 2017, [{ id: 'rr', from: 2008, to: 2010 }, { id: 'mi', from: 2011, to: 2013 }, { id: 'gl', from: 2016, to: 2017 }]),
  P('Adam Zampa', 'BOWL', 1, 10, 82, 2016, 2025, [{ id: 'rps', from: 2016, to: 2017 }, { id: 'rcb', from: 2019, to: 2021 }, { id: 'rr', from: 2022, to: 2025 }]),
  P('Brad Hodge', 'BAT', 1, 78, 15, 2008, 2015, [{ id: 'kkr', from: 2008, to: 2009 }, { id: 'ktk', from: 2011, to: 2011 }, { id: 'rr', from: 2013, to: 2015 }]),
  P('Avesh Khan', 'BOWL', 0, 5, 79, 2017, 2025, [{ id: 'dd', from: 2017, to: 2018 }, { id: 'dcap', from: 2019, to: 2020 }, { id: 'lsg', from: 2022, to: 2022 }, { id: 'rr', from: 2023, to: 2025 }]),

  // ---- GT core ----
  P('Sai Sudharsan', 'BAT', 0, 86, 0, 2022, 2025, [{ id: 'gt', from: 2022, to: 2025 }]),
  P('Sai Kishore', 'BOWL', 0, 20, 76, 2022, 2025, [{ id: 'gt', from: 2022, to: 2025 }]),
  P('David Miller', 'BAT', 1, 84, 0, 2012, 2025, [{ id: 'kxip', from: 2012, to: 2013 }, { id: 'rr', from: 2017, to: 2019 }, { id: 'gt', from: 2022, to: 2022 }, { id: 'lsg', from: 2023, to: 2025 }]),
  P('Matthew Wade', 'WK', 1, 76, 0, 2011, 2023, [{ id: 'dd', from: 2011, to: 2016 }, { id: 'gt', from: 2022, to: 2023 }]),
  P('Washington Sundar', 'AR', 0, 65, 76, 2017, 2025, [{ id: 'rps', from: 2017, to: 2017 }, { id: 'rcb', from: 2019, to: 2020 }, { id: 'srh', from: 2021, to: 2022 }, { id: 'gt', from: 2023, to: 2025 }]),

  // ---- LSG core ----
  P('KL Rahul', 'WK', 0, 89, 0, 2013, 2025, [{ id: 'rcb', from: 2013, to: 2014 }, { id: 'srh', from: 2015, to: 2016 }, { id: 'kxip', from: 2017, to: 2019 }, { id: 'lsg', from: 2022, to: 2022 }, { id: 'dcap', from: 2023, to: 2025 }]),
  P('Nicholas Pooran', 'WK', 1, 88, 0, 2019, 2025, [{ id: 'kxip', from: 2019, to: 2019 }, { id: 'pbks', from: 2021, to: 2021 }, { id: 'srh', from: 2022, to: 2023 }, { id: 'lsg', from: 2024, to: 2025 }]),
  P('Marcus Stoinis', 'AR', 1, 78, 68, 2015, 2025, [{ id: 'kxip', from: 2015, to: 2016 }, { id: 'rps', from: 2017, to: 2017 }, { id: 'dcap', from: 2019, to: 2020 }, { id: 'lsg', from: 2022, to: 2022 }, { id: 'pbks', from: 2023, to: 2025 }]),
  P('Ravi Bishnoi', 'BOWL', 0, 5, 81, 2020, 2025, [{ id: 'kxip', from: 2020, to: 2020 }, { id: 'pbks', from: 2022, to: 2023 }, { id: 'lsg', from: 2024, to: 2025 }]),
  P('Mayank Yadav', 'BOWL', 0, 5, 80, 2024, 2025, [{ id: 'lsg', from: 2024, to: 2025 }]),
  P('Mitchell Marsh', 'AR', 1, 82, 70, 2011, 2025, [{ id: 'pwi', from: 2011, to: 2013 }, { id: 'rps', from: 2016, to: 2017 }, { id: 'dcap', from: 2019, to: 2021 }, { id: 'lsg', from: 2022, to: 2025 }]),
  P('Deepak Hooda', 'AR', 0, 70, 45, 2016, 2025, [{ id: 'rr', from: 2016, to: 2017 }, { id: 'srh', from: 2018, to: 2019 }, { id: 'pbks', from: 2021, to: 2022 }, { id: 'lsg', from: 2023, to: 2025 }]),

  // ---- DC (Capitals) core ----
  P('Rishabh Pant', 'WK', 0, 88, 0, 2016, 2025, [{ id: 'dd', from: 2016, to: 2018 }, { id: 'dcap', from: 2019, to: 2021 }, { id: 'lsg', from: 2022, to: 2025 }]),
  P('Axar Patel', 'AR', 0, 68, 82, 2013, 2025, [{ id: 'mi', from: 2013, to: 2016 }, { id: 'kxip', from: 2017, to: 2020 }, { id: 'dcap', from: 2021, to: 2025 }]),
  P('Kagiso Rabada', 'BOWL', 1, 20, 89, 2017, 2025, [{ id: 'dd', from: 2017, to: 2018 }, { id: 'dcap', from: 2019, to: 2020 }, { id: 'pbks', from: 2021, to: 2022 }, { id: 'gt', from: 2023, to: 2025 }]),
  P('Prithvi Shaw', 'BAT', 0, 77, 0, 2018, 2024, [{ id: 'dd', from: 2018, to: 2018 }, { id: 'dcap', from: 2021, to: 2024 }]),
  P('Jake Fraser-McGurk', 'BAT', 1, 82, 0, 2024, 2025, [{ id: 'dcap', from: 2024, to: 2025 }]),

  // ---- PBKS core ----
  P('Arshdeep Singh', 'BOWL', 0, 10, 83, 2019, 2025, [{ id: 'kxip', from: 2019, to: 2020 }, { id: 'pbks', from: 2022, to: 2025 }]),
  P('Prabhsimran Singh', 'WK', 0, 77, 0, 2019, 2025, [{ id: 'kxip', from: 2019, to: 2020 }, { id: 'pbks', from: 2022, to: 2025 }]),
  P('Shashank Singh', 'BAT', 0, 75, 10, 2022, 2025, [{ id: 'pbks', from: 2022, to: 2025 }]),

  // ---- KXIP-era ----
  P('Virender Sehwag', 'BAT', 0, 87, 25, 2008, 2015, [{ id: 'dd', from: 2008, to: 2011 }, { id: 'kxip', from: 2012, to: 2015 }]),
  P('Yuvraj Singh', 'AR', 0, 83, 60, 2008, 2019, [{ id: 'kxip', from: 2008, to: 2009 }, { id: 'pwi', from: 2011, to: 2011 }, { id: 'rcb', from: 2012, to: 2013 }, { id: 'dd', from: 2014, to: 2015 }, { id: 'srh', from: 2016, to: 2017 }, { id: 'mi', from: 2018, to: 2019 }]),
  P('Adam Gilchrist', 'WK', 1, 88, 0, 2008, 2013, [{ id: 'dch', from: 2008, to: 2010 }, { id: 'kxip', from: 2011, to: 2013 }]),
  P('Kumar Sangakkara', 'WK', 1, 82, 0, 2008, 2013, [{ id: 'kxip', from: 2008, to: 2009 }, { id: 'dch', from: 2010, to: 2011 }, { id: 'srh', from: 2013, to: 2013 }]),
  P('Mahela Jayawardene', 'BAT', 1, 80, 0, 2008, 2014, [{ id: 'kxip', from: 2008, to: 2009 }, { id: 'ktk', from: 2011, to: 2011 }, { id: 'dd', from: 2012, to: 2014 }]),
  P('Shaun Marsh', 'BAT', 1, 82, 0, 2008, 2017, [{ id: 'kxip', from: 2008, to: 2017 }]),
  P('Mayank Agarwal', 'BAT', 0, 78, 0, 2011, 2025, [{ id: 'rcb', from: 2011, to: 2012 }, { id: 'dd', from: 2013, to: 2014 }, { id: 'rps', from: 2016, to: 2016 }, { id: 'kxip', from: 2017, to: 2019 }, { id: 'pbks', from: 2021, to: 2022 }, { id: 'srh', from: 2023, to: 2025 }]),
  P('Sreesanth', 'BOWL', 0, 5, 75, 2008, 2013, [{ id: 'kxip', from: 2008, to: 2009 }, { id: 'ktk', from: 2011, to: 2011 }, { id: 'rr', from: 2012, to: 2013 }]),
  P('Irfan Pathan', 'AR', 0, 65, 72, 2008, 2017, [{ id: 'kxip', from: 2008, to: 2010 }, { id: 'dd', from: 2011, to: 2013 }, { id: 'srh', from: 2014, to: 2017 }]),
  P('Andrew Tye', 'BOWL', 1, 10, 78, 2017, 2022, [{ id: 'gl', from: 2017, to: 2017 }, { id: 'kxip', from: 2019, to: 2020 }, { id: 'rr', from: 2021, to: 2022 }]),
  P('Praveen Kumar', 'BOWL', 0, 30, 79, 2008, 2017, [{ id: 'rcb', from: 2008, to: 2009 }, { id: 'kxip', from: 2010, to: 2011 }, { id: 'mi', from: 2012, to: 2013 }, { id: 'srh', from: 2014, to: 2015 }, { id: 'gl', from: 2016, to: 2017 }]),

  // ---- DD-era ----
  P('Ashish Nehra', 'BOWL', 0, 5, 81, 2008, 2017, [{ id: 'dd', from: 2008, to: 2009 }, { id: 'mi', from: 2010, to: 2011 }, { id: 'pwi', from: 2012, to: 2013 }, { id: 'csk', from: 2014, to: 2015 }, { id: 'srh', from: 2016, to: 2017 }]),
  P('Amit Mishra', 'BOWL', 0, 30, 83, 2008, 2023, [{ id: 'dd', from: 2008, to: 2011 }, { id: 'dch', from: 2012, to: 2012 }, { id: 'srh', from: 2016, to: 2019 }, { id: 'lsg', from: 2022, to: 2023 }]),
  P('JP Duminy', 'AR', 1, 76, 50, 2009, 2019, [{ id: 'mi', from: 2009, to: 2013 }, { id: 'dd', from: 2014, to: 2018 }]),
  P('Manoj Tiwary', 'BAT', 0, 72, 10, 2008, 2018, [{ id: 'dd', from: 2008, to: 2009 }, { id: 'kkr', from: 2010, to: 2012 }, { id: 'kxip', from: 2016, to: 2018 }]),
  P('Jesse Ryder', 'BAT', 1, 74, 25, 2009, 2014, [{ id: 'rcb', from: 2009, to: 2010 }, { id: 'pwi', from: 2011, to: 2012 }, { id: 'dd', from: 2013, to: 2014 }]),
  P('Wayne Parnell', 'BOWL', 1, 35, 74, 2009, 2017, [{ id: 'dd', from: 2009, to: 2012 }, { id: 'pwi', from: 2013, to: 2013 }]),
  P('Angelo Mathews', 'AR', 1, 70, 74, 2009, 2017, [{ id: 'kkr', from: 2009, to: 2011 }, { id: 'pwi', from: 2012, to: 2013 }, { id: 'dd', from: 2015, to: 2017 }]),
  P('Rahul Sharma', 'BOWL', 0, 5, 72, 2011, 2014, [{ id: 'pwi', from: 2011, to: 2012 }, { id: 'dd', from: 2013, to: 2014 }]),

  // ---- DCH-era ----
  P('Herschelle Gibbs', 'BAT', 1, 79, 0, 2008, 2012, [{ id: 'dch', from: 2008, to: 2012 }]),
  P('Andrew Symonds', 'AR', 1, 81, 65, 2008, 2011, [{ id: 'dch', from: 2008, to: 2009 }, { id: 'mi', from: 2010, to: 2011 }]),
  P('Pragyan Ojha', 'BOWL', 0, 5, 78, 2008, 2015, [{ id: 'dch', from: 2008, to: 2011 }, { id: 'mi', from: 2012, to: 2015 }]),
  P('Ishant Sharma', 'BOWL', 0, 5, 76, 2008, 2024, [{ id: 'kkr', from: 2008, to: 2009 }, { id: 'dch', from: 2010, to: 2011 }, { id: 'srh', from: 2013, to: 2013 }, { id: 'kxip', from: 2014, to: 2015 }, { id: 'dd', from: 2016, to: 2018 }, { id: 'dcap', from: 2019, to: 2021 }, { id: 'gt', from: 2022, to: 2024 }]),
  P('Cameron White', 'BAT', 1, 76, 15, 2009, 2014, [{ id: 'rcb', from: 2009, to: 2010 }, { id: 'dch', from: 2011, to: 2012 }, { id: 'srh', from: 2013, to: 2014 }]),
  P('Y Venugopal Rao', 'BAT', 0, 60, 20, 2008, 2012, [{ id: 'dch', from: 2008, to: 2012 }]),
  P('Dwaraka Ravi Teja', 'BAT', 0, 56, 15, 2008, 2012, [{ id: 'dch', from: 2008, to: 2012 }]),
  P('RP Singh', 'BOWL', 0, 5, 79, 2008, 2013, [{ id: 'dch', from: 2008, to: 2009 }, { id: 'ktk', from: 2011, to: 2011 }, { id: 'mi', from: 2012, to: 2013 }]),
  P('Dwayne Smith', 'BAT', 1, 79, 40, 2008, 2017, [{ id: 'dch', from: 2008, to: 2009 }, { id: 'mi', from: 2010, to: 2011 }, { id: 'csk', from: 2012, to: 2014 }, { id: 'gl', from: 2016, to: 2017 }]),
  P('Parthiv Patel', 'WK', 0, 72, 0, 2008, 2020, [{ id: 'csk', from: 2008, to: 2009 }, { id: 'ktk', from: 2011, to: 2011 }, { id: 'dch', from: 2012, to: 2012 }, { id: 'srh', from: 2014, to: 2015 }, { id: 'mi', from: 2016, to: 2017 }, { id: 'rcb', from: 2018, to: 2020 }]),

  // ---- PWI-era ----
  P('Sourav Ganguly', 'BAT', 0, 76, 40, 2008, 2012, [{ id: 'kkr', from: 2008, to: 2009 }, { id: 'pwi', from: 2011, to: 2012 }]),
  P('Michael Clarke', 'BAT', 1, 72, 25, 2012, 2012, [{ id: 'pwi', from: 2012, to: 2012 }]),
  P('Aaron Finch', 'BAT', 1, 81, 5, 2011, 2022, [{ id: 'pwi', from: 2011, to: 2011 }, { id: 'mi', from: 2013, to: 2014 }, { id: 'gl', from: 2016, to: 2016 }, { id: 'kxip', from: 2017, to: 2018 }, { id: 'kkr', from: 2019, to: 2020 }, { id: 'rcb', from: 2021, to: 2022 }]),
  P('Ashok Dinda', 'BOWL', 0, 5, 74, 2008, 2018, [{ id: 'kkr', from: 2008, to: 2010 }, { id: 'pwi', from: 2011, to: 2013 }, { id: 'rps', from: 2016, to: 2017 }]),
  P('Murali Kartik', 'BOWL', 0, 25, 74, 2008, 2014, [{ id: 'kkr', from: 2008, to: 2008 }, { id: 'kxip', from: 2009, to: 2010 }, { id: 'pwi', from: 2011, to: 2012 }, { id: 'rcb', from: 2013, to: 2014 }]),
  P('Mithun Manhas', 'BAT', 0, 60, 0, 2008, 2015, [{ id: 'dd', from: 2008, to: 2009 }, { id: 'pwi', from: 2011, to: 2012 }, { id: 'csk', from: 2013, to: 2015 }]),
  P('Manish Pandey', 'BAT', 0, 77, 0, 2008, 2025, [{ id: 'rcb', from: 2008, to: 2010 }, { id: 'pwi', from: 2011, to: 2013 }, { id: 'kkr', from: 2014, to: 2016 }, { id: 'srh', from: 2017, to: 2019 }, { id: 'lsg', from: 2022, to: 2022 }, { id: 'dcap', from: 2023, to: 2025 }]),

  // ---- KTK-era ----
  P('VVS Laxman', 'BAT', 0, 68, 0, 2008, 2011, [{ id: 'dch', from: 2008, to: 2009 }, { id: 'ktk', from: 2011, to: 2011 }]),
  P('Roelof van der Merwe', 'AR', 1, 50, 72, 2009, 2011, [{ id: 'rcb', from: 2009, to: 2009 }, { id: 'ktk', from: 2011, to: 2011 }]),
  P('Vinay Kumar', 'BOWL', 0, 20, 76, 2008, 2018, [{ id: 'rcb', from: 2008, to: 2009 }, { id: 'ktk', from: 2011, to: 2011 }, { id: 'mi', from: 2013, to: 2015 }, { id: 'kkr', from: 2016, to: 2018 }]),
  P('Jacob Oram', 'AR', 1, 60, 70, 2008, 2011, [{ id: 'csk', from: 2008, to: 2009 }, { id: 'ktk', from: 2011, to: 2011 }]),
  P('Prasanth Parameswaran', 'BOWL', 0, 5, 58, 2011, 2011, [{ id: 'ktk', from: 2011, to: 2011 }]),

  // ---- misc multi-team ----
  P('Jaydev Unadkat', 'BOWL', 0, 25, 76, 2010, 2025, [{ id: 'kkr', from: 2010, to: 2012 }, { id: 'dd', from: 2013, to: 2015 }, { id: 'rps', from: 2016, to: 2017 }, { id: 'rr', from: 2019, to: 2021 }, { id: 'lsg', from: 2022, to: 2025 }]),
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
