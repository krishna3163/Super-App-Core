const INDIAN_NAMES = [
  "Rahul Sharma", "Priya Patel", "Amit Singh", "Sneha Rao", "Vikram Malhotra",
  "Ananya Gupta", "Sandeep Varma", "Deepika Padukone", "Ranveer Singh", "Karan Johar",
  "Alia Bhatt", "Varun Dhawan", "Siddharth Malhotra", "Kiara Advani", "Rajkummar Rao",
  "Ayushmann Khurrana", "Bhumi Pednekar", "Vicky Kaushal", "Katrina Kaif", "Akshay Kumar",
  "Salman Khan", "Shah Rukh Khan", "Aamir Khan", "Kareena Kapoor", "Deepika Padukone",
  "Priyanka Chopra", "Nick Jonas", "Sonam Kapoor", "Arjun Kapoor", "Janhvi Kapoor",
  "Sara Ali Khan", "Kartik Aaryan", "Rashmika Mandanna", "Vijay Deverakonda", "Dulquer Salmaan",
  "Fahadh Faasil", "Samantha Ruth Prabhu", "Nayanthara", "Prabhas", "Allu Arjun",
  "Jr NTR", "Ram Charan", "Yash", "Rishab Shetty", "Rakshit Shetty",
  "Anushka Shetty", "Kajal Aggarwal", "Tamannaah Bhatia", "Aditi Rao Hydari", "Sobhita Dhulipala"
];

const users = INDIAN_NAMES.map((name, i) => {
  const username = name.toLowerCase().replace(/\s+/g, "_") + "_" + i;
  return {
    firebaseUid: `uid_${i}`,
    username,
    displayName: name,
    email: `${username}@example.com`,
    bio: `Hi, I'm ${name}! Excited to be on Super App.`,
    avatarUrl: `https://i.pravatar.cc/150?u=${username}`,
    status: "active",
    onlineStatus: i % 2 === 0 ? "online" : "offline",
    followersCount: Math.floor(Math.random() * 1000),
    followingCount: Math.floor(Math.random() * 500),
    createdAt: new Date(),
    updatedAt: new Date()
  };
});

// We can't run this directly easily without the connection, but we can use the MCP tool!
console.log(JSON.stringify(users));
