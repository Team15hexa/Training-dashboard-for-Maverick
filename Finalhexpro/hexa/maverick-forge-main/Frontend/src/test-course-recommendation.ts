// Test file for course recommendation logic
// This is a simple test to verify the recommendCourse function works correctly

const recommendCourse = (skills: string[]): string => {
  if (!skills || skills.length === 0) {
    return "No course available";
  }

  // Convert skills to lowercase for case-insensitive matching
  const normalizedSkills = skills.map(skill => skill.toLowerCase());
  
  // Course definitions with their required skills
  const courses = [
    {
      name: "Full Stack Development",
      skills: ['html', 'css', 'js', 'javascript', 'sql', 'react', 'node', 'node.js']
    },
    {
      name: "MERN Stack",
      skills: ['javascript', 'mongodb', 'express', 'react', 'node', 'node.js', 'mongo']
    },
    {
      name: "Java Developer",
      skills: ['java', 'spring', 'spring boot', 'spring framework']
    },
    {
      name: "Python Developer",
      skills: ['python', 'flask', 'django', 'py']
    },
    {
      name: "Data Analytics",
      skills: ['python', 'sql', 'pandas', 'excel', 'numpy', 'data science', 'data analysis', 'analytics']
    }
  ];

  // Calculate match scores for each course
  const courseScores = courses.map(course => {
    const matchedSkills = course.skills.filter(skill => 
      normalizedSkills.some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );
    return {
      name: course.name,
      score: matchedSkills.length,
      totalSkills: course.skills.length,
      matchPercentage: (matchedSkills.length / course.skills.length) * 100
    };
  });

  // Find the best match (highest match percentage)
  const bestMatch = courseScores.reduce((best, current) => {
    if (current.score === 0) return best;
    if (best.score === 0) return current;
    return current.matchPercentage > best.matchPercentage ? current : best;
  });

  // Return the best course if there's a match, otherwise "No course available"
  return bestMatch.score > 0 ? bestMatch.name : "No course available";
};

// Test cases
console.log("Testing course recommendation logic:");
console.log("-----------------------------------");

// Test 1: Full Stack Development skills
console.log("Test 1 - Full Stack skills:");
const fullStackSkills = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL'];
console.log("Skills:", fullStackSkills);
console.log("Recommended course:", recommendCourse(fullStackSkills));
console.log("");

// Test 2: MERN Stack skills
console.log("Test 2 - MERN Stack skills:");
const mernSkills = ['JavaScript', 'MongoDB', 'Express', 'React', 'Node.js'];
console.log("Skills:", mernSkills);
console.log("Recommended course:", recommendCourse(mernSkills));
console.log("");

// Test 3: Java Developer skills
console.log("Test 3 - Java Developer skills:");
const javaSkills = ['Java', 'Spring Boot', 'Spring Framework'];
console.log("Skills:", javaSkills);
console.log("Recommended course:", recommendCourse(javaSkills));
console.log("");

// Test 4: Python Developer skills
console.log("Test 4 - Python Developer skills:");
const pythonSkills = ['Python', 'Django', 'Flask'];
console.log("Skills:", pythonSkills);
console.log("Recommended course:", recommendCourse(pythonSkills));
console.log("");

// Test 5: Data Analytics skills
console.log("Test 5 - Data Analytics skills:");
const dataSkills = ['Python', 'SQL', 'Pandas', 'NumPy', 'Data Science'];
console.log("Skills:", dataSkills);
console.log("Recommended course:", recommendCourse(dataSkills));
console.log("");

// Test 6: No matching skills
console.log("Test 6 - No matching skills:");
const noMatchSkills = ['Photoshop', 'Illustrator', 'Design'];
console.log("Skills:", noMatchSkills);
console.log("Recommended course:", recommendCourse(noMatchSkills));
console.log("");

// Test 7: Empty skills array
console.log("Test 7 - Empty skills array:");
const emptySkills: string[] = [];
console.log("Skills:", emptySkills);
console.log("Recommended course:", recommendCourse(emptySkills));
console.log("");

console.log("All tests completed!"); 