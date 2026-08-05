import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  universities,
  faculties,
  departments,
  subjects,
  topics,
  universityCourses,
} from "@/db/schema";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    // Skip university/faculty/dept creation if already done, but always try courses
    const facCount = await db.select({ c: sql<number>`COUNT(*)::int` }).from(faculties);
    const skipStructure = facCount[0].c > 3;

    // Get existing UNICAL
    const [unical] = await db.select().from(universities);
    if (!unical) {
      return NextResponse.json({ success: false, message: "Run /api/seed first." }, { status: 400 });
    }

    // ================================================
    // OTHER UNIVERSITIES (shell entries for future)
    // ================================================
    const otherUnis = [
      { name: "University of Lagos", shortName: "UNILAG", location: "Lagos" },
      { name: "University of Nigeria, Nsukka", shortName: "UNN", location: "Nsukka, Enugu" },
      { name: "Ahmadu Bello University", shortName: "ABU", location: "Zaria, Kaduna" },
      { name: "Federal University of Technology, Akure", shortName: "FUTA", location: "Akure, Ondo" },
      { name: "Obafemi Awolowo University", shortName: "OAU", location: "Ile-Ife, Osun" },
      { name: "University of Ibadan", shortName: "UI", location: "Ibadan, Oyo" },
      { name: "University of Benin", shortName: "UNIBEN", location: "Benin City, Edo" },
      { name: "University of Port Harcourt", shortName: "UNIPORT", location: "Port Harcourt, Rivers" },
      { name: "Federal University of Technology, Owerri", shortName: "FUTO", location: "Owerri, Imo" },
      { name: "University of Ilorin", shortName: "UNILORIN", location: "Ilorin, Kwara" },
    ];

    if (!skipStructure) {
      for (const uni of otherUnis) {
        try {
          await db.insert(universities).values(uni).onConflictDoNothing();
        } catch {
          // Skip
        }
      }
    }

    // ================================================
    // UNICAL FACULTIES & DEPARTMENTS (complete)
    // ================================================
    const unicalFaculties: { name: string; departments: string[] }[] = [
      {
        name: "Faculty of Engineering & Technology",
        departments: [
          "Agricultural & Bioresource Engineering",
          "Chemical Engineering",
          "Civil & Environmental Engineering",
          "Computer Engineering",
          "Electrical & Electronics Engineering",
          "Mechanical Engineering",
          "Petroleum Engineering",
        ],
      },
      {
        name: "Faculty of Science",
        departments: [
          "Botany",
          "Computer Science",
          "Genetics & Biotechnology",
          "Geology",
          "Mathematics",
          "Microbiology",
          "Physics",
          "Pure & Applied Chemistry",
          "Statistics",
          "Zoology & Environmental Biology",
        ],
      },
      {
        name: "Faculty of Arts",
        departments: [
          "English & Literary Studies",
          "History & International Studies",
          "Linguistics & Communication Studies",
          "Philosophy",
          "Religious Studies & Philosophy",
          "Theatre Arts",
          "Music",
          "French",
          "Fine & Applied Arts",
        ],
      },
      {
        name: "Faculty of Social Sciences",
        departments: [
          "Economics",
          "Geography & Environmental Science",
          "Political Science",
          "Sociology",
          "Social Work",
          "Peace & Conflict Studies",
        ],
      },
      {
        name: "Faculty of Education",
        departments: [
          "Educational Administration & Planning",
          "Educational Technology",
          "Curriculum & Teaching",
          "Guidance & Counselling",
          "Human Kinetics & Health Education",
          "Library & Information Science",
          "Adult Education",
          "Special Education",
          "Science Education",
          "Arts Education",
          "Vocational & Technical Education",
        ],
      },
      {
        name: "Faculty of Law",
        departments: [
          "Private Law",
          "Public Law",
          "Jurisprudence & International Law",
        ],
      },
      {
        name: "Faculty of Management Sciences",
        departments: [
          "Accounting",
          "Banking & Finance",
          "Business Management",
          "Marketing",
          "Public Administration",
        ],
      },
      {
        name: "Faculty of Agriculture",
        departments: [
          "Animal Science",
          "Crop Science",
          "Fisheries & Aquaculture",
          "Food Science & Technology",
          "Forestry & Wildlife Management",
          "Soil Science",
          "Agricultural Economics & Extension",
        ],
      },
      {
        name: "Faculty of Allied Medical Sciences",
        departments: [
          "Medical Laboratory Science",
          "Nursing Science",
          "Radiography",
          "Public Health",
        ],
      },
      {
        name: "Faculty of Basic Medical Sciences",
        departments: [
          "Anatomy",
          "Biochemistry",
          "Physiology",
          "Pharmacology",
        ],
      },
      {
        name: "Faculty of Clinical Sciences",
        departments: [
          "Medicine & Surgery",
          "Dentistry",
        ],
      },
      {
        name: "Faculty of Environmental Sciences",
        departments: [
          "Architecture",
          "Building Technology",
          "Estate Management",
          "Urban & Regional Planning",
          "Surveying & Geoinformatics",
          "Environmental Protection & Resource Management",
        ],
      },
      {
        name: "Faculty of Communication Technology",
        departments: [
          "Mass Communication",
          "Information Technology",
        ],
      },
    ];

    if (!skipStructure) {
    // Get existing Engineering faculty
    const existingFacs = await db.select().from(faculties);
    const engFaculty = existingFacs[0];

    for (const fac of unicalFaculties) {
      // Skip if it's engineering (already exists)
      if (fac.name.includes("Engineering") && engFaculty) {
        // Add missing departments to existing engineering faculty
        for (const deptName of fac.departments) {
          try {
            await db.insert(departments).values({
              name: deptName,
              facultyId: engFaculty.id,
            });
          } catch {
            // Already exists
          }
        }
        continue;
      }

      // Create new faculty
      let facultyId: number;
      try {
        const [newFac] = await db
          .insert(faculties)
          .values({ name: fac.name, universityId: unical.id })
          .returning();
        facultyId = newFac.id;
      } catch {
        continue;
      }

      // Add departments
      for (const deptName of fac.departments) {
        try {
          await db.insert(departments).values({
            name: deptName,
            facultyId,
          });
        } catch {
          // Skip duplicates
        }
      }
    }
    } // end if (!skipStructure)

    // ================================================
    // SUBJECTS (universal academic subjects)
    // ================================================
    const newSubjects = [
      // Engineering
      { name: "Thermodynamics", slug: "thermodynamics", description: "Heat, work, energy, entropy, and thermodynamic cycles.", fieldOfStudy: "Mechanical Engineering", iconEmoji: "🔥" },
      { name: "Fluid Mechanics", slug: "fluid-mechanics", description: "Fluid statics, dynamics, viscosity, Bernoulli equation.", fieldOfStudy: "Mechanical/Civil Engineering", iconEmoji: "💧" },
      { name: "Strength of Materials", slug: "strength-of-materials", description: "Stress, strain, bending, torsion, beam deflection.", fieldOfStudy: "Civil/Mechanical Engineering", iconEmoji: "🏗️" },
      { name: "Engineering Drawing", slug: "engineering-drawing", description: "Technical drawing, orthographic projection, CAD.", fieldOfStudy: "Engineering", iconEmoji: "📐" },
      { name: "Computer Programming", slug: "computer-programming", description: "C, C++, Python, data structures, algorithms.", fieldOfStudy: "Computer/Electrical Engineering", iconEmoji: "💻" },
      // Sciences
      { name: "Organic Chemistry", slug: "organic-chemistry", description: "Carbon compounds, reactions, nomenclature, synthesis.", fieldOfStudy: "Chemistry", iconEmoji: "🧪" },
      { name: "Calculus", slug: "calculus", description: "Differentiation, integration, series, multivariable calculus.", fieldOfStudy: "Mathematics", iconEmoji: "📊" },
      { name: "Linear Algebra", slug: "linear-algebra", description: "Matrices, vectors, eigenvalues, linear transformations.", fieldOfStudy: "Mathematics", iconEmoji: "🔢" },
      { name: "General Biology", slug: "general-biology", description: "Cell biology, genetics, ecology, evolution.", fieldOfStudy: "Biology", iconEmoji: "🧬" },
      { name: "General Physics", slug: "general-physics", description: "Mechanics, waves, optics, electricity, magnetism.", fieldOfStudy: "Physics", iconEmoji: "⚛️" },
      // General Studies
      { name: "Use of English", slug: "use-of-english", description: "English grammar, essay writing, comprehension, communication.", fieldOfStudy: "General Studies", iconEmoji: "📝" },
      { name: "Nigerian History", slug: "nigerian-history", description: "Pre-colonial, colonial, and post-independence Nigeria.", fieldOfStudy: "General Studies", iconEmoji: "📜" },
      { name: "Philosophy & Logic", slug: "philosophy-logic", description: "Critical thinking, arguments, logical reasoning.", fieldOfStudy: "General Studies", iconEmoji: "🤔" },
      // Law
      { name: "Constitutional Law", slug: "constitutional-law", description: "Nigerian constitution, fundamental rights, government structure.", fieldOfStudy: "Law", iconEmoji: "⚖️" },
      { name: "Law of Contract", slug: "law-of-contract", description: "Agreement, consideration, breach, remedies.", fieldOfStudy: "Law", iconEmoji: "📋" },
      // Business
      { name: "Principles of Accounting", slug: "principles-of-accounting", description: "Double entry, financial statements, trial balance.", fieldOfStudy: "Accounting", iconEmoji: "📒" },
      { name: "Principles of Economics", slug: "principles-of-economics", description: "Micro and macroeconomics, demand, supply, market structures.", fieldOfStudy: "Economics", iconEmoji: "📈" },
      // Medical
      { name: "Human Anatomy", slug: "human-anatomy", description: "Skeletal, muscular, nervous, cardiovascular systems.", fieldOfStudy: "Medicine", iconEmoji: "🫀" },
      { name: "Human Physiology", slug: "human-physiology", description: "Body functions, homeostasis, organ systems.", fieldOfStudy: "Medicine", iconEmoji: "🫁" },
    ];

    for (const sub of newSubjects) {
      try {
        const existing = await db.select().from(subjects).where(sql`slug = ${sub.slug}`);
        if (existing.length === 0) {
          await db.insert(subjects).values(sub);
        }
      } catch {
        // Skip
      }
    }

    // ================================================
    // COURSES for key UNICAL departments
    // ================================================
    // Get all departments and subjects for linking
    const allDepts = await db.select().from(departments);
    const allSubjects = await db.select().from(subjects);

    const findDept = (name: string) => allDepts.find((d) => d.name.toLowerCase().includes(name.toLowerCase()));
    const findSubject = (slug: string) => allSubjects.find((s) => s.slug === slug);

    const coursesToAdd: {
      courseCode: string;
      courseTitle: string;
      deptSearch: string;
      subjectSlug: string;
      creditUnit: number;
      semester: string;
      level: number;
    }[] = [
      // === General Studies (all students take these) ===
      { courseCode: "GST111", courseTitle: "Communication in English I", deptSearch: "English", subjectSlug: "use-of-english", creditUnit: 2, semester: "First", level: 100 },
      { courseCode: "GST112", courseTitle: "Nigerian History", deptSearch: "History", subjectSlug: "nigerian-history", creditUnit: 2, semester: "First", level: 100 },
      { courseCode: "GST121", courseTitle: "Use of Library", deptSearch: "Library", subjectSlug: "use-of-english", creditUnit: 2, semester: "Second", level: 100 },
      { courseCode: "GST122", courseTitle: "Communication in English II", deptSearch: "English", subjectSlug: "use-of-english", creditUnit: 2, semester: "Second", level: 100 },
      { courseCode: "GST211", courseTitle: "Philosophy & Logic", deptSearch: "Philosophy", subjectSlug: "philosophy-logic", creditUnit: 2, semester: "First", level: 200 },

      // === Computer Science ===
      { courseCode: "CSC101", courseTitle: "Introduction to Computer Science", deptSearch: "Computer Science", subjectSlug: "computer-programming", creditUnit: 3, semester: "First", level: 100 },
      { courseCode: "CSC201", courseTitle: "Computer Programming I (C)", deptSearch: "Computer Science", subjectSlug: "computer-programming", creditUnit: 3, semester: "First", level: 200 },
      { courseCode: "CSC202", courseTitle: "Computer Programming II (C++)", deptSearch: "Computer Science", subjectSlug: "computer-programming", creditUnit: 3, semester: "Second", level: 200 },

      // === Mathematics ===
      { courseCode: "MTH101", courseTitle: "Elementary Mathematics I", deptSearch: "Mathematics", subjectSlug: "calculus", creditUnit: 3, semester: "First", level: 100 },
      { courseCode: "MTH102", courseTitle: "Elementary Mathematics II", deptSearch: "Mathematics", subjectSlug: "calculus", creditUnit: 3, semester: "Second", level: 100 },
      { courseCode: "MTH201", courseTitle: "Mathematical Methods I", deptSearch: "Mathematics", subjectSlug: "calculus", creditUnit: 4, semester: "First", level: 200 },
      { courseCode: "MTH202", courseTitle: "Linear Algebra I", deptSearch: "Mathematics", subjectSlug: "linear-algebra", creditUnit: 3, semester: "Second", level: 200 },

      // === Physics ===
      { courseCode: "PHY101", courseTitle: "General Physics I (Mechanics)", deptSearch: "Physics", subjectSlug: "general-physics", creditUnit: 3, semester: "First", level: 100 },
      { courseCode: "PHY102", courseTitle: "General Physics II (Electricity)", deptSearch: "Physics", subjectSlug: "general-physics", creditUnit: 3, semester: "Second", level: 100 },
      { courseCode: "PHY103", courseTitle: "General Physics Lab I", deptSearch: "Physics", subjectSlug: "general-physics", creditUnit: 1, semester: "First", level: 100 },

      // === Chemistry ===
      { courseCode: "CHM101", courseTitle: "General Chemistry I", deptSearch: "Chemistry", subjectSlug: "organic-chemistry", creditUnit: 3, semester: "First", level: 100 },
      { courseCode: "CHM102", courseTitle: "General Chemistry II", deptSearch: "Chemistry", subjectSlug: "organic-chemistry", creditUnit: 3, semester: "Second", level: 100 },

      // === Biology ===
      { courseCode: "BIO101", courseTitle: "General Biology I", deptSearch: "Botany", subjectSlug: "general-biology", creditUnit: 3, semester: "First", level: 100 },
      { courseCode: "BIO102", courseTitle: "General Biology II", deptSearch: "Botany", subjectSlug: "general-biology", creditUnit: 3, semester: "Second", level: 100 },

      // === Mechanical Engineering ===
      { courseCode: "MEE311", courseTitle: "Thermodynamics I", deptSearch: "Mechanical", subjectSlug: "thermodynamics", creditUnit: 3, semester: "First", level: 300 },
      { courseCode: "MEE321", courseTitle: "Fluid Mechanics I", deptSearch: "Mechanical", subjectSlug: "fluid-mechanics", creditUnit: 3, semester: "First", level: 300 },
      { courseCode: "MEE312", courseTitle: "Strength of Materials I", deptSearch: "Mechanical", subjectSlug: "strength-of-materials", creditUnit: 3, semester: "First", level: 300 },

      // === Civil Engineering ===
      { courseCode: "CVE311", courseTitle: "Structural Analysis I", deptSearch: "Civil", subjectSlug: "strength-of-materials", creditUnit: 3, semester: "First", level: 300 },
      { courseCode: "CVE321", courseTitle: "Fluid Mechanics", deptSearch: "Civil", subjectSlug: "fluid-mechanics", creditUnit: 3, semester: "First", level: 300 },

      // === Engineering Drawing (all engineering) ===
      { courseCode: "ENG101", courseTitle: "Engineering Drawing I", deptSearch: "Mechanical", subjectSlug: "engineering-drawing", creditUnit: 2, semester: "First", level: 100 },
      { courseCode: "ENG102", courseTitle: "Workshop Practice", deptSearch: "Mechanical", subjectSlug: "engineering-drawing", creditUnit: 2, semester: "Second", level: 100 },

      // === Law ===
      { courseCode: "LLB201", courseTitle: "Constitutional Law I", deptSearch: "Public Law", subjectSlug: "constitutional-law", creditUnit: 4, semester: "First", level: 200 },
      { courseCode: "LLB202", courseTitle: "Law of Contract I", deptSearch: "Private Law", subjectSlug: "law-of-contract", creditUnit: 4, semester: "First", level: 200 },

      // === Accounting ===
      { courseCode: "ACC101", courseTitle: "Principles of Accounting I", deptSearch: "Accounting", subjectSlug: "principles-of-accounting", creditUnit: 3, semester: "First", level: 100 },
      { courseCode: "ACC102", courseTitle: "Principles of Accounting II", deptSearch: "Accounting", subjectSlug: "principles-of-accounting", creditUnit: 3, semester: "Second", level: 100 },

      // === Economics ===
      { courseCode: "ECO101", courseTitle: "Principles of Economics I", deptSearch: "Economics", subjectSlug: "principles-of-economics", creditUnit: 3, semester: "First", level: 100 },
      { courseCode: "ECO102", courseTitle: "Principles of Economics II", deptSearch: "Economics", subjectSlug: "principles-of-economics", creditUnit: 3, semester: "Second", level: 100 },

      // === Medicine ===
      { courseCode: "ANA201", courseTitle: "Human Anatomy I", deptSearch: "Anatomy", subjectSlug: "human-anatomy", creditUnit: 4, semester: "First", level: 200 },
      { courseCode: "PHS201", courseTitle: "Human Physiology I", deptSearch: "Physiology", subjectSlug: "human-physiology", creditUnit: 4, semester: "First", level: 200 },

      // === Computer Engineering ===
      { courseCode: "CPE311", courseTitle: "Digital Systems Design", deptSearch: "Computer Engineering", subjectSlug: "digital-electronics", creditUnit: 3, semester: "First", level: 300 },
      { courseCode: "CPE321", courseTitle: "Computer Architecture", deptSearch: "Computer Engineering", subjectSlug: "computer-programming", creditUnit: 3, semester: "First", level: 300 },
    ];

    let addedCourses = 0;

    for (const course of coursesToAdd) {
      const dept = findDept(course.deptSearch);
      const subject = findSubject(course.subjectSlug);

      if (!dept || !subject) continue;

      try {
        await db.insert(universityCourses).values({
          courseCode: course.courseCode,
          courseTitle: course.courseTitle,
          departmentId: dept.id,
          subjectId: subject.id,
          creditUnit: course.creditUnit,
          semester: course.semester,
          level: course.level,
        });
        addedCourses++;
      } catch {
        // Already exists — skip
      }
    }

    // Count totals
    const totalUnis = await db.select({ c: sql<number>`COUNT(*)::int` }).from(universities);
    const totalFacs = await db.select({ c: sql<number>`COUNT(*)::int` }).from(faculties);
    const totalDepts = await db.select({ c: sql<number>`COUNT(*)::int` }).from(departments);
    const totalCourses = await db.select({ c: sql<number>`COUNT(*)::int` }).from(universityCourses);
    const totalSubjects = await db.select({ c: sql<number>`COUNT(*)::int` }).from(subjects);

    return NextResponse.json({
      success: true,
      message: `Full seed complete.`,
      data: {
        universities: totalUnis[0].c,
        faculties: totalFacs[0].c,
        departments: totalDepts[0].c,
        courses: totalCourses[0].c,
        subjects: totalSubjects[0].c,
        newCoursesAdded: addedCourses,
      },
    });
  } catch (error) {
    console.error("Full seed error:", error);
    return NextResponse.json(
      { success: false, message: "Full seed failed." },
      { status: 500 }
    );
  }
}
