import { db } from "@/db";
import {
  universities,
  faculties,
  departments,
  subjects,
  topics,
  universityCourses,
  questions,
  solutions,
  questionAppearances,
  achievements,
} from "@/db/schema";

export async function seedDatabase() {
  const existing = await db.select().from(universities);
  if (existing.length > 0) return { message: "Already seeded" };

  // ===== SINGLE UNIVERSITY: UNICAL =====
  const [unical] = await db
    .insert(universities)
    .values({
      name: "University of Calabar",
      shortName: "UNICAL",
      location: "Calabar, Cross River State",
    })
    .returning();

  // ===== SINGLE FACULTY =====
  const [engFaculty] = await db
    .insert(faculties)
    .values({ name: "Faculty of Engineering", universityId: unical.id })
    .returning();

  // ===== SINGLE DEPARTMENT =====
  const [eeeDept] = await db
    .insert(departments)
    .values({
      name: "Electrical & Electronics Engineering",
      facultyId: engFaculty.id,
    })
    .returning();

  // ===== SUBJECTS (only what EEE 300L actually takes) =====
  const subData = [
    {
      name: "Digital Electronics",
      slug: "digital-electronics",
      description:
        "Digital logic design, Boolean algebra, combinational and sequential circuits, flip-flops, counters and registers.",
      fieldOfStudy: "Electrical Engineering",
      iconEmoji: "🔌",
    },
    {
      name: "Electromagnetic Fields & Waves",
      slug: "electromagnetic-fields",
      description:
        "Electrostatics, magnetostatics, Maxwell equations, electromagnetic wave propagation and transmission lines.",
      fieldOfStudy: "Electrical Engineering",
      iconEmoji: "⚡",
    },
    {
      name: "Circuit Theory",
      slug: "circuit-theory",
      description:
        "Network theorems, two-port networks, frequency response, Bode plots, resonance and filter design.",
      fieldOfStudy: "Electrical Engineering",
      iconEmoji: "🔋",
    },
    {
      name: "Control Engineering",
      slug: "control-engineering",
      description:
        "Feedback systems, transfer functions, Bode plots, stability analysis, root locus.",
      fieldOfStudy: "Electrical Engineering",
      iconEmoji: "🎛️",
    },
  ];
  const insertedSubs = await db.insert(subjects).values(subData).returning();
  const [sDigital, sEM, sCircuit, sControl] = insertedSubs;

  // ===== TOPICS (real EEE 300L syllabus content) =====
  const topicData = [
    // Digital Electronics — EEE322
    {
      name: "Boolean Algebra",
      slug: "boolean-algebra",
      description:
        "Laws, theorems, and simplification of Boolean expressions and truth tables.",
      subjectId: sDigital.id,
      orderIndex: 1,
      notes:
        "Key Laws:\n• Commutative: A+B = B+A, A·B = B·A\n• Associative: (A+B)+C = A+(B+C)\n• Distributive: A·(B+C) = A·B + A·C\n• Identity: A+0=A, A·1=A\n• Complement: A+A'=1, A·A'=0\n• Idempotent: A+A=A, A·A=A",
      formulas:
        "De Morgan's Theorems:\n(A+B)' = A'·B'\n(A·B)' = A'+B'\n\nAbsorption:\nA + A·B = A\nA·(A+B) = A\n\nConsensus:\nAB + A'C + BC = AB + A'C",
      examTips:
        "• Always simplify expressions before implementing\n• Check your work using truth tables\n• Look for common patterns like XOR\n• This topic appears in almost every exam",
    },
    {
      name: "Karnaugh Maps",
      slug: "karnaugh-maps",
      description:
        "K-map simplification for 2, 3, 4, and 5 variable Boolean expressions.",
      subjectId: sDigital.id,
      orderIndex: 2,
      notes:
        "Steps:\n1. Draw the K-map with correct Gray code variable ordering\n2. Fill in 1s for each minterm in the function\n3. Group adjacent 1s in largest possible power-of-2 groups\n4. Groups can wrap around edges\n5. Write simplified expression from groups",
      formulas:
        "Group sizes:\n• Group of 1 = uses all 4 variables\n• Group of 2 = eliminates 1 variable\n• Group of 4 = eliminates 2 variables\n• Group of 8 = eliminates 3 variables\n• Group of 16 = function equals 1",
      examTips:
        "• Always look for the largest possible groups first\n• Groups can wrap around K-map edges\n• Don't forget don't-care conditions\n• Check for essential prime implicants",
    },
    {
      name: "Combinational Logic Circuits",
      slug: "combinational-logic",
      description:
        "Multiplexers, demultiplexers, encoders, decoders, adders and subtractors.",
      subjectId: sDigital.id,
      orderIndex: 3,
      examTips:
        "• MUX and full adder designs appear very frequently\n• Always show truth table before circuit\n• Know how to implement any function using MUX",
    },
    {
      name: "Sequential Logic Circuits",
      slug: "sequential-logic",
      description:
        "Flip-flops (SR, D, JK, T), latches, timing diagrams and state machines.",
      subjectId: sDigital.id,
      orderIndex: 4,
      notes:
        "Flip-Flop Types:\n• SR: Set-Reset, invalid when S=R=1\n• D: Data, Q follows D on clock edge\n• JK: Universal, toggles when J=K=1\n• T: Toggle, changes state when T=1\n\nMaster-slave eliminates race conditions.",
      formulas:
        "Characteristic Equations:\nSR: Q(n+1) = S + R'Q (S·R=0)\nD: Q(n+1) = D\nJK: Q(n+1) = JQ' + K'Q\nT: Q(n+1) = T ⊕ Q",
      examTips:
        "• JK flip-flop is asked in almost every exam\n• Know how to convert between flip-flop types\n• Practice state machine design",
    },
    {
      name: "Counters & Registers",
      slug: "counters-registers",
      description:
        "Synchronous and asynchronous counters, shift registers, ring counters.",
      subjectId: sDigital.id,
      orderIndex: 5,
    },
    {
      name: "Number Systems & Codes",
      slug: "number-systems",
      description:
        "Binary, octal, hexadecimal, BCD, Gray code and number conversions.",
      subjectId: sDigital.id,
      orderIndex: 6,
      examTips:
        "• Number conversion questions appear in every exam\n• Practice 2's complement subtraction\n• Know BCD, Excess-3, and Gray code conversions",
    },
    // Circuit Theory — EEE311
    {
      name: "Network Theorems",
      slug: "network-theorems",
      description:
        "Thevenin, Norton, Superposition, Maximum Power Transfer theorems.",
      subjectId: sCircuit.id,
      orderIndex: 1,
      notes:
        "Key Theorems:\n• Thevenin: Replace circuit with Vth + Rth in series\n• Norton: Replace circuit with In + Rn in parallel\n• Superposition: Analyze each independent source separately\n• Max Power Transfer: RL = Rth for maximum power",
      formulas:
        "Thevenin: Vth = Voc, Rth = Voc/Isc\nNorton: In = Isc, Rn = Rth\nMax Power: PL(max) = Vth²/(4Rth)",
    },
    {
      name: "Two-Port Networks",
      slug: "two-port-networks",
      description:
        "Z, Y, h and ABCD parameters and their interrelations.",
      subjectId: sCircuit.id,
      orderIndex: 2,
    },
    // Control Engineering — EEE351
    {
      name: "Transfer Functions",
      slug: "transfer-functions",
      description:
        "Poles, zeros, block diagram reduction, signal flow graphs.",
      subjectId: sControl.id,
      orderIndex: 1,
    },
    {
      name: "Stability Analysis",
      slug: "stability-analysis",
      description:
        "Routh-Hurwitz criterion, Nyquist stability, root locus method.",
      subjectId: sControl.id,
      orderIndex: 2,
    },
  ];
  const insertedTopics = await db.insert(topics).values(topicData).returning();

  const tBool = insertedTopics.find((t) => t.slug === "boolean-algebra")!;
  const tKmap = insertedTopics.find((t) => t.slug === "karnaugh-maps")!;
  const tComb = insertedTopics.find((t) => t.slug === "combinational-logic")!;
  const tSeq = insertedTopics.find((t) => t.slug === "sequential-logic")!;
  const tCount = insertedTopics.find((t) => t.slug === "counters-registers")!;
  const tNum = insertedTopics.find((t) => t.slug === "number-systems")!;
  const tNet = insertedTopics.find((t) => t.slug === "network-theorems")!;
  const tTwoPort = insertedTopics.find((t) => t.slug === "two-port-networks")!;
  const tTransfer = insertedTopics.find((t) => t.slug === "transfer-functions")!;
  const tStab = insertedTopics.find((t) => t.slug === "stability-analysis")!;

  // ===== COURSES (only UNICAL EEE 300L) =====
  const courseData = [
    { courseCode: "EEE322", courseTitle: "Logic Design", departmentId: eeeDept.id, subjectId: sDigital.id, creditUnit: 3, semester: "First", level: 300 },
    { courseCode: "EEE324", courseTitle: "Electromagnetic Fields & Waves", departmentId: eeeDept.id, subjectId: sEM.id, creditUnit: 3, semester: "First", level: 300 },
    { courseCode: "EEE311", courseTitle: "Circuit Theory II", departmentId: eeeDept.id, subjectId: sCircuit.id, creditUnit: 3, semester: "First", level: 300 },
    { courseCode: "EEE351", courseTitle: "Control Engineering I", departmentId: eeeDept.id, subjectId: sControl.id, creditUnit: 3, semester: "Second", level: 300 },
  ];
  const insertedCourses = await db.insert(universityCourses).values(courseData).returning();
  const cDigital = insertedCourses.find((c) => c.courseCode === "EEE322")!;
  const cCircuit = insertedCourses.find((c) => c.courseCode === "EEE311")!;
  const cControl = insertedCourses.find((c) => c.courseCode === "EEE351")!;

  // ===== QUESTIONS (real exam-style for EEE 300L) =====
  const qData = [
    // EEE322 — Boolean Algebra (most tested)
    { questionText: "Simplify the Boolean expression F = AB + A'B'C + ABC' using Boolean algebra theorems.", marks: 8, difficulty: "medium" as const, topicId: tBool.id, commandWord: "Simplify" },
    { questionText: "State and prove De Morgan's theorem. Verify using a truth table for three variables.", marks: 10, difficulty: "medium" as const, topicId: tBool.id, commandWord: "State" },
    { questionText: "Explain the concept of duality in Boolean algebra with examples.", marks: 6, difficulty: "easy" as const, topicId: tBool.id, commandWord: "Explain" },
    { questionText: "Simplify F = A'BC + AB'C + ABC' + ABC to minimum SOP form.", marks: 8, difficulty: "medium" as const, topicId: tBool.id, commandWord: "Simplify" },
    { questionText: "Using Boolean algebra, show that A + A'B = A + B (absorption theorem).", marks: 5, difficulty: "easy" as const, topicId: tBool.id, commandWord: "Derive" },
    { questionText: "Implement the expression F = AB + CD using only NAND gates.", marks: 10, difficulty: "medium" as const, topicId: tBool.id, commandWord: "Design" },
    { questionText: "Find the complement of F = AB'C + A'BC' + ABC.", marks: 5, difficulty: "easy" as const, topicId: tBool.id, commandWord: "Calculate" },
    { questionText: "Prove the consensus theorem: AB + A'C + BC = AB + A'C.", marks: 8, difficulty: "hard" as const, topicId: tBool.id, commandWord: "Derive" },

    // EEE322 — K-Maps
    { questionText: "Use a Karnaugh map to simplify F(A,B,C,D) = Σ(0,1,2,5,8,9,10).", marks: 8, difficulty: "medium" as const, topicId: tKmap.id, commandWord: "Simplify" },
    { questionText: "Simplify F(A,B,C) = Σ(0,2,4,5,6) using a 3-variable K-map. Implement using NAND gates only.", marks: 10, difficulty: "medium" as const, topicId: tKmap.id, commandWord: "Simplify" },
    { questionText: "Design a BCD to Excess-3 code converter using K-map simplification.", marks: 15, difficulty: "hard" as const, topicId: tKmap.id, commandWord: "Design" },
    { questionText: "Use a 4-variable K-map to simplify F = Σ(0,2,4,5,6,7,8,10,13) with don't cares d(1,12).", marks: 10, difficulty: "hard" as const, topicId: tKmap.id, commandWord: "Simplify" },
    { questionText: "Explain the concept of prime implicants and essential prime implicants with K-map examples.", marks: 10, difficulty: "medium" as const, topicId: tKmap.id, commandWord: "Explain" },

    // EEE322 — Combinational Logic
    { questionText: "Design a 4-to-1 multiplexer using basic logic gates. Show the truth table, Boolean expression, and circuit diagram.", marks: 12, difficulty: "hard" as const, topicId: tComb.id, commandWord: "Design" },
    { questionText: "Design a full adder using two half adders. Show the truth table, Boolean expression, and circuit.", marks: 10, difficulty: "medium" as const, topicId: tComb.id, commandWord: "Design" },
    { questionText: "Design a BCD to 7-segment decoder. Show the truth table and derive simplified expressions for each segment output.", marks: 15, difficulty: "hard" as const, topicId: tComb.id, commandWord: "Design" },
    { questionText: "Implement a 3-to-8 line decoder and explain how it can function as a demultiplexer.", marks: 10, difficulty: "medium" as const, topicId: tComb.id, commandWord: "Design" },
    { questionText: "Implement F(A,B,C) = Σ(1,3,5,7) using an 8-to-1 multiplexer.", marks: 8, difficulty: "medium" as const, topicId: tComb.id, commandWord: "Design" },
    { questionText: "Explain the difference between a decoder and a demultiplexer with circuit examples.", marks: 6, difficulty: "easy" as const, topicId: tComb.id, commandWord: "Explain" },

    // EEE322 — Sequential Logic
    { questionText: "Explain the operation of a JK flip-flop. Draw its circuit symbol, truth table, and characteristic equation.", marks: 10, difficulty: "medium" as const, topicId: tSeq.id, commandWord: "Explain" },
    { questionText: "Explain with diagrams: (a) D flip-flop (b) T flip-flop. Show how to convert a JK flip-flop to each.", marks: 10, difficulty: "easy" as const, topicId: tSeq.id, commandWord: "Explain" },
    { questionText: "Design a sequence detector for the pattern 1011 using a Moore state machine.", marks: 15, difficulty: "hard" as const, topicId: tSeq.id, commandWord: "Design" },
    { questionText: "Compare Moore and Mealy machines. Give an example state diagram for each.", marks: 10, difficulty: "medium" as const, topicId: tSeq.id, commandWord: "Compare" },
    { questionText: "Derive the excitation table for SR, D, JK, and T flip-flops.", marks: 8, difficulty: "medium" as const, topicId: tSeq.id, commandWord: "Derive" },
    { questionText: "Explain race conditions and hazards in sequential circuits. How are they avoided?", marks: 8, difficulty: "medium" as const, topicId: tSeq.id, commandWord: "Explain" },
    { questionText: "What is a master-slave flip-flop? Draw the circuit and explain why it is needed.", marks: 6, difficulty: "easy" as const, topicId: tSeq.id, commandWord: "Explain" },

    // EEE322 — Counters
    { questionText: "Design a modulo-8 synchronous counter using JK flip-flops. Show state table, state diagram, and circuit.", marks: 15, difficulty: "hard" as const, topicId: tCount.id, commandWord: "Design" },
    { questionText: "Compare and contrast synchronous and asynchronous counters. Design a 4-bit asynchronous up counter.", marks: 12, difficulty: "medium" as const, topicId: tCount.id, commandWord: "Compare" },
    { questionText: "Design a mod-6 counter using JK flip-flops. Show complete design procedure.", marks: 12, difficulty: "medium" as const, topicId: tCount.id, commandWord: "Design" },
    { questionText: "Explain the operation of a universal shift register with block diagram.", marks: 10, difficulty: "medium" as const, topicId: tCount.id, commandWord: "Explain" },
    { questionText: "Design a ring counter and a Johnson counter. Compare their output sequences.", marks: 10, difficulty: "medium" as const, topicId: tCount.id, commandWord: "Design" },

    // EEE322 — Number Systems
    { questionText: "Convert: (a) (110101.101)₂ to decimal (b) (AF3)₁₆ to binary (c) (752)₈ to hexadecimal.", marks: 6, difficulty: "easy" as const, topicId: tNum.id, commandWord: "Calculate" },
    { questionText: "Perform binary subtraction using 2's complement method: 10110 - 11001.", marks: 5, difficulty: "easy" as const, topicId: tNum.id, commandWord: "Calculate" },
    { questionText: "Explain BCD, Excess-3, and Gray code. Convert (147)₁₀ to each representation.", marks: 8, difficulty: "medium" as const, topicId: tNum.id, commandWord: "Explain" },
    { questionText: "What is the advantage of Gray code over standard binary? Design a 3-bit binary to Gray code converter.", marks: 10, difficulty: "medium" as const, topicId: tNum.id, commandWord: "Design" },

    // EEE311 — Network Theorems
    { questionText: "State Thevenin's theorem. Find the Thevenin equivalent for a circuit with a 12V source, 4Ω and 6Ω resistors.", marks: 10, difficulty: "medium" as const, topicId: tNet.id, commandWord: "State" },
    { questionText: "Using the superposition theorem, find the current through a 5Ω resistor in a circuit with two independent voltage sources.", marks: 12, difficulty: "medium" as const, topicId: tNet.id, commandWord: "Calculate" },
    { questionText: "Prove the maximum power transfer theorem. Under what condition is maximum power delivered to the load?", marks: 10, difficulty: "medium" as const, topicId: tNet.id, commandWord: "Derive" },
    { questionText: "Find the Norton equivalent circuit for a network containing dependent sources.", marks: 12, difficulty: "hard" as const, topicId: tNet.id, commandWord: "Calculate" },
    { questionText: "Compare Thevenin and Norton equivalent circuits. Show mathematically that they are equivalent.", marks: 8, difficulty: "easy" as const, topicId: tNet.id, commandWord: "Compare" },

    // EEE311 — Two-Port Networks
    { questionText: "Define and derive the Z-parameters for a T-network. Show the equivalent circuit.", marks: 10, difficulty: "medium" as const, topicId: tTwoPort.id, commandWord: "Derive" },
    { questionText: "Find the h-parameters of a given two-port network and draw the h-parameter equivalent circuit.", marks: 12, difficulty: "hard" as const, topicId: tTwoPort.id, commandWord: "Calculate" },

    // EEE351 — Control Engineering
    { questionText: "Derive the transfer function of a second-order RLC circuit.", marks: 10, difficulty: "medium" as const, topicId: tTransfer.id, commandWord: "Derive" },
    { questionText: "Reduce the given block diagram to find the overall transfer function C(s)/R(s).", marks: 12, difficulty: "hard" as const, topicId: tTransfer.id, commandWord: "Calculate" },
    { questionText: "What are poles and zeros of a transfer function? Explain their effect on system response.", marks: 8, difficulty: "medium" as const, topicId: tTransfer.id, commandWord: "Explain" },
    { questionText: "Using the Routh-Hurwitz criterion, determine the stability of a system with characteristic equation s⁴ + 2s³ + 3s² + 4s + 5 = 0.", marks: 12, difficulty: "hard" as const, topicId: tStab.id, commandWord: "Calculate" },
    { questionText: "Explain the root locus method. Sketch the root locus for G(s) = K/[s(s+2)(s+4)].", marks: 15, difficulty: "hard" as const, topicId: tStab.id, commandWord: "Explain" },
  ];
  const insertedQs = await db.insert(questions).values(qData).returning();

  // ===== APPEARANCES (UNICAL only, realistic year distribution) =====
  const appData: { questionId: number; universityCourseId: number; year: number }[] = [];
  const add = (qi: number, cId: number, years: number[]) => {
    years.forEach((y) => appData.push({ questionId: insertedQs[qi].id, universityCourseId: cId, year: y }));
  };

  // Boolean Algebra — most tested
  add(0, cDigital.id, [2024, 2023, 2022, 2021]);      // Simplify — always appears
  add(1, cDigital.id, [2024, 2022, 2020]);              // De Morgan's
  add(2, cDigital.id, [2023]);                            // Duality
  add(3, cDigital.id, [2024, 2021]);                      // SOP simplification
  add(4, cDigital.id, [2022]);                            // Absorption
  add(5, cDigital.id, [2023]);                            // NAND implementation
  add(6, cDigital.id, [2024]);                            // Complement
  add(7, cDigital.id, [2023]);                            // Consensus

  // K-Maps
  add(8, cDigital.id, [2024, 2023, 2022]);               // 4-var K-map — repeated
  add(9, cDigital.id, [2022, 2021]);                      // 3-var + NAND
  add(10, cDigital.id, [2024]);                           // BCD to Excess-3
  add(11, cDigital.id, [2023]);                           // Don't cares
  add(12, cDigital.id, [2024, 2022]);                     // Prime implicants

  // Combinational
  add(13, cDigital.id, [2024, 2023, 2022, 2021]);        // MUX — always asked
  add(14, cDigital.id, [2023, 2021]);                     // Full adder
  add(15, cDigital.id, [2022]);                           // 7-segment decoder
  add(16, cDigital.id, [2024, 2023]);                     // 3-to-8 decoder
  add(17, cDigital.id, [2024]);                           // MUX implementation
  add(18, cDigital.id, [2021]);                           // Decoder vs DEMUX

  // Sequential
  add(19, cDigital.id, [2024, 2023, 2022, 2021, 2020]); // JK FF — every single exam
  add(20, cDigital.id, [2023, 2021]);                     // D and T FF
  add(21, cDigital.id, [2024]);                           // Sequence detector
  add(22, cDigital.id, [2023]);                           // Moore vs Mealy
  add(23, cDigital.id, [2024, 2022]);                     // Excitation table
  add(24, cDigital.id, [2022]);                           // Race conditions
  add(25, cDigital.id, [2021]);                           // Master-slave

  // Counters
  add(26, cDigital.id, [2023, 2020]);                     // Mod-8 counter
  add(27, cDigital.id, [2022]);                           // Sync vs async
  add(28, cDigital.id, [2024, 2023]);                     // Mod-6 counter
  add(29, cDigital.id, [2024]);                           // Shift register
  add(30, cDigital.id, [2022]);                           // Ring/Johnson counter

  // Number Systems — always tested
  add(31, cDigital.id, [2024, 2023, 2022, 2021, 2020]); // Conversion — every exam
  add(32, cDigital.id, [2024, 2022]);                     // 2's complement
  add(33, cDigital.id, [2023]);                           // BCD/Gray code
  add(34, cDigital.id, [2024]);                           // Gray converter

  // Circuit Theory
  add(35, cCircuit.id, [2024, 2023, 2022]);              // Thevenin
  add(36, cCircuit.id, [2024, 2022]);                     // Superposition
  add(37, cCircuit.id, [2023]);                           // Max power
  add(38, cCircuit.id, [2024]);                           // Norton
  add(39, cCircuit.id, [2024]);                           // Thevenin vs Norton
  add(40, cCircuit.id, [2024, 2023]);                     // Z-parameters
  add(41, cCircuit.id, [2024]);                           // h-parameters

  // Control Engineering
  add(42, cControl.id, [2024, 2023]);                     // Transfer function
  add(43, cControl.id, [2024]);                           // Block diagram
  add(44, cControl.id, [2024, 2023]);                     // Poles and zeros
  add(45, cControl.id, [2024]);                           // Routh-Hurwitz
  add(46, cControl.id, [2024]);                           // Root locus

  await db.insert(questionAppearances).values(appData);

  // ===== SOLUTIONS (for frequently tested questions) =====
  const solData = [
    {
      questionId: insertedQs[0].id,
      solutionText: "Step 1: F = AB + A'B'C + ABC'\nStep 2: AB = AB(C + C') = ABC + ABC'\nStep 3: F = ABC + ABC' + A'B'C + ABC'\nStep 4: Combine: F = ABC + ABC' + A'B'C\nStep 5: Factor: F = AB(C + C') + A'B'C = AB + A'B'C\n\nFinal Answer: F = AB + A'B'C",
      explanation: "AB absorbs ABC' through the absorption theorem. The expression AB + A'B'C cannot be further simplified as the terms differ in two variables.",
      commonMistakes: "Trying to combine AB and A'B'C — they differ in more than one variable, so they cannot be merged into a single term.",
      marksAllocation: "Identifying applicable theorems (2 marks), Correct application of steps (4 marks), Final simplified expression (2 marks)",
    },
    {
      questionId: insertedQs[1].id,
      solutionText: "De Morgan's Theorem:\n1. (A + B)' = A'·B'\n2. (A·B)' = A' + B'\n\nProof of (1) using truth table:\nA  B | A+B | (A+B)' | A' | B' | A'·B'\n0  0 |  0  |   1    |  1 |  1 |   1\n0  1 |  1  |   0    |  1 |  0 |   0\n1  0 |  1  |   0    |  0 |  1 |   0\n1  1 |  1  |   0    |  0 |  0 |   0\n\nSince (A+B)' = A'·B' in all rows, the theorem is proved. ✓",
      explanation: "De Morgan's theorem relates AND and OR through complementation. It is essential for converting between gate types, especially for NAND/NOR implementations.",
      marksAllocation: "Statement of both theorems (2 marks), Proof with truth table (4 marks), Verification for 3 variables (4 marks)",
    },
    {
      questionId: insertedQs[8].id,
      solutionText: "K-map for F(A,B,C,D) = Σ(0,1,2,5,8,9,10):\n\n       CD\n       00  01  11  10\nAB 00 | 1 | 1 | 0 | 1 |\nAB 01 | 0 | 1 | 0 | 0 |\nAB 11 | 0 | 0 | 0 | 0 |\nAB 10 | 1 | 1 | 0 | 1 |\n\nGroups identified:\n• (0,1,8,9) → B'C'\n• (0,2,8,10) → B'D'\n• (1,5) → A'C'D\n\nSimplified: F = B'C' + B'D' + A'C'D",
      explanation: "K-map grouping eliminates variables that change within a group. Larger groups = simpler terms. The K-map wraps around so cells in row 00 are adjacent to cells in row 10.",
      commonMistakes: "Not finding the largest groups. Always check for wrapping around edges. Also, overlapping groups are allowed and often necessary.",
      marksAllocation: "Correct K-map filling (2 marks), Identifying optimal groups (3 marks), Deriving simplified expression (3 marks)",
    },
    {
      questionId: insertedQs[13].id,
      solutionText: "4-to-1 Multiplexer Design:\n\nTruth Table:\nS1 S0 | Y\n 0  0 | I0\n 0  1 | I1\n 1  0 | I2\n 1  1 | I3\n\nBoolean Expression:\nY = S1'·S0'·I0 + S1'·S0·I1 + S1·S0'·I2 + S1·S0·I3\n\nCircuit: 4 AND gates (3-input each) + 1 OR gate (4-input)\nEach AND gate takes one input line with appropriate select line combination.",
      explanation: "A 4-to-1 MUX selects one of four inputs based on two select lines. Each input is ANDed with the corresponding minterm of the select lines.",
      commonMistakes: "Forgetting to include all select line inversions. Each AND gate needs the correct S1/S1' and S0/S0' combination.",
      marksAllocation: "Truth table (3 marks), Boolean expression (3 marks), Logic diagram (4 marks), Correct connections (2 marks)",
    },
    {
      questionId: insertedQs[19].id,
      solutionText: "JK Flip-Flop:\n\nTruth Table:\nJ  K | Q(n+1) | Operation\n0  0 |  Q(n)  | No Change (Hold)\n0  1 |   0    | Reset\n1  0 |   1    | Set\n1  1 | Q'(n)  | Toggle\n\nCharacteristic Equation: Q(n+1) = JQ' + K'Q\n\nThe JK flip-flop improves on the SR flip-flop by eliminating the invalid state. When J=K=1, the output toggles.",
      explanation: "The JK is the most versatile flip-flop. When J=K=0, output holds. J=0,K=1 resets. J=1,K=0 sets. J=K=1 toggles. This makes it ideal for counters.",
      commonMistakes: "Confusing the characteristic equation with the excitation table. The characteristic equation gives Q(n+1) given current inputs and state.",
      marksAllocation: "Circuit symbol (2 marks), Truth table (3 marks), Characteristic equation with derivation (3 marks), Explanation of operation (2 marks)",
    },
    {
      questionId: insertedQs[31].id,
      solutionText: "(a) (110101.101)₂ to decimal:\n= 1×32 + 1×16 + 0×8 + 1×4 + 0×2 + 1×1 + 1×0.5 + 0×0.25 + 1×0.125\n= 32 + 16 + 4 + 1 + 0.5 + 0.125\n= 53.625\n\n(b) (AF3)₁₆ to binary:\nA = 1010, F = 1111, 3 = 0011\n= 1010 1111 0011₂\n\n(c) (752)₈ to hex:\n7 = 111, 5 = 101, 2 = 010\nBinary: 111 101 010\nGroup in 4: 0001 1110 1010\n= 1EA₁₆",
      explanation: "For decimal conversion, multiply each digit by its positional weight. For hex-to-binary, replace each hex digit with 4 bits. For octal-to-hex, convert through binary first.",
      marksAllocation: "2 marks per conversion (6 marks total)",
    },
    {
      questionId: insertedQs[35].id,
      solutionText: "Thevenin's Theorem Statement:\nAny linear bilateral circuit with two terminals can be replaced by an equivalent circuit consisting of a voltage source Vth in series with a resistance Rth.\n\nFor 12V source with 4Ω and 6Ω:\nAssuming voltage divider configuration:\nVth = 12 × 6/(4+6) = 12 × 0.6 = 7.2V\nRth = 4||6 = (4×6)/(4+6) = 24/10 = 2.4Ω\n\nThevenin equivalent: 7.2V source in series with 2.4Ω resistor",
      explanation: "Vth is the open-circuit voltage at the terminals. Rth is found by deactivating all independent sources (voltage sources → short, current sources → open) and finding resistance between terminals.",
      marksAllocation: "Statement (2 marks), Finding Vth (4 marks), Finding Rth (4 marks)",
    },
  ];
  await db.insert(solutions).values(solData);

  // ===== ACHIEVEMENTS =====
  const achData = [
    { name: "First Steps", description: "View your first past question", iconEmoji: "👀", requirement: "questions_viewed:1", points: 5 },
    { name: "Scholar", description: "View 50 past questions", iconEmoji: "📚", requirement: "questions_viewed:50", points: 25 },
    { name: "Practice Makes Perfect", description: "Complete 10 practice sessions", iconEmoji: "💪", requirement: "practice_sessions:10", points: 30 },
    { name: "Streak Starter", description: "3-day study streak", iconEmoji: "🔥", requirement: "streak:3", points: 15 },
    { name: "Week Warrior", description: "7-day study streak", iconEmoji: "⚡", requirement: "streak:7", points: 35 },
    { name: "Contributor", description: "Upload your first content", iconEmoji: "🎁", requirement: "uploads:1", points: 20 },
    { name: "Perfect Score", description: "100% in a practice session", iconEmoji: "💯", requirement: "perfect_practice:1", points: 25 },
  ];
  await db.insert(achievements).values(achData);

  return {
    message:
      "Seeded: UNICAL → Engineering → EEE 300L | 4 courses, 4 subjects, 10 topics, 47 questions, 7 solutions",
  };
}
