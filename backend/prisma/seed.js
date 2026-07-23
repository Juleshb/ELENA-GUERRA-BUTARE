require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const story = require('./schoolStoryContent');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@schoolhuye.rw' },
    update: {},
    create: {
      email: 'admin@schoolhuye.rw',
      password,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  const brandSettings = {
    schoolName: 'C.S ELENA GUERRA',
    tagline: 'BUTARE',
    logoUrl: '/logo.jpg',
    heroTitle: 'C.S ELENA GUERRA',
    heroSubtitle: 'Esprit, garde-nous dans ton amour',
    about: story.ABOUT_SHORT,
    mission: story.MISSION,
    vision: story.VISION,
    schoolMotto: story.SCHOOL_MOTTO,
    historicalBackground: story.HISTORICAL_BACKGROUND,
    principalMessage: story.PRINCIPAL_MESSAGE,
    principalTitle: 'Headmistress',
    principalName: null,
    principalPhotoUrl: null,
    motherElenaHistory: story.MOTHER_ELENA_HISTORY,
    motherElenaPhotoUrl: null,
    directorMessage: story.DIRECTOR_MESSAGE,
    directorName: 'MANIRAGABA Bernard',
    directorPhotoUrl: null,
    address: 'Taba village, Butare cell, Ngoma sector, Huye district, Southern Province, Rwanda',
    phone: '+250 788 000 000',
    email: 'info@elenguerra.rw',
  };

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: brandSettings,
    create: {
      id: 'default',
      ...brandSettings,
    },
  });

  const pages = [
    {
      title: 'About Us',
      slug: 'about',
      excerpt: 'Learn about our history, values, and commitment to education.',
      content:
        '<p>School Huye has served the community for decades, providing quality education and fostering a culture of excellence.</p><p>Our dedicated faculty and modern facilities create an environment where every student can thrive.</p>',
      published: true,
      showInNav: true,
      navOrder: 1,
    },
    {
      title: 'Admissions',
      slug: 'admissions',
      excerpt: 'How to apply and join our school community.',
      content:
        '<p>We welcome applications from students who are eager to learn and grow. Contact our admissions office for requirements and deadlines.</p>',
      published: true,
      showInNav: true,
      navOrder: 2,
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }

  await prisma.post.upsert({
    where: { slug: 'welcome-new-academic-year' },
    update: {},
    create: {
      title: 'Welcome to the New Academic Year',
      slug: 'welcome-new-academic-year',
      excerpt: 'We are excited to begin another year of learning and growth.',
      content:
        '<p>As we open our doors for the new academic year, we extend a warm welcome to all students, parents, and staff. Together we will achieve great things.</p>',
      published: true,
      publishedAt: new Date(),
    },
  });

  const staffCount = await prisma.staffMember.count();
  if (staffCount === 0) {
    await prisma.staffMember.createMany({
      data: [
        {
          name: 'Jean Baptiste N.',
          role: 'Head Teacher',
          department: 'Administration',
          bio: 'Leading the school with over 20 years of educational experience.',
          published: true,
          order: 1,
        },
        {
          name: 'Marie Claire U.',
          role: 'Deputy Head',
          department: 'Administration',
          bio: 'Supporting academic programs and student welfare.',
          published: true,
          order: 2,
        },
      ],
    });
  }

  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await prisma.event.create({
      data: {
        title: 'Open Day',
        description: 'Visit our campus, meet teachers, and learn about our programs.',
        location: 'School Huye Campus',
        startDate: nextMonth,
        published: true,
      },
    });
  }

  await prisma.admissionProtocol.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      intro:
        'School Huye welcomes new learners who demonstrate commitment to academic excellence and good conduct. Our admissions process is transparent, fair, and aligned with national education guidelines.',
      overview:
        'Applications are accepted for Primary (P1–P6), Ordinary Level (S1–S3), and Advanced Level (S4–S6) where places are available. All applicants must complete the steps below and submit required documents to the Admissions Office.',
      applicationEmail: 'admissions@schoolhuye.rw',
      applicationPhone: '+250 788 000 000',
      officeHours: 'Monday – Friday, 8:00 AM – 4:00 PM',
      deadlineNote:
        'Application deadline for the new academic year is typically 31 July. Late applications may be considered only if places remain available.',
      published: true,
    },
  });

  const stepCount = await prisma.admissionStep.count();
  if (stepCount === 0) {
    await prisma.admissionStep.createMany({
      data: [
        {
          stepNumber: 1,
          title: 'Submit Your Application Online',
          description:
            'Complete the online application at schoolhuye.rw/apply — no campus visit needed for initial submission. Upload documents digitally, or submit the form first and bring certified copies later. One application per student.',
          published: true,
        },
        {
          stepNumber: 2,
          title: 'Prepare Required Documents',
          description:
            'Gather all supporting documents listed in the requirements section. Ensure copies are certified where indicated. Foreign documents must be translated into English or Kinyarwanda and notarized.',
          published: true,
        },
        {
          stepNumber: 3,
          title: 'Submit Application Package',
          description:
            'Submit the completed form and documents to the Admissions Office in person or via the official email. You will receive an acknowledgement receipt with your application reference number.',
          published: true,
        },
        {
          stepNumber: 4,
          title: 'Entrance Assessment / Interview',
          description:
            'Shortlisted candidates are invited for an entrance assessment (Primary and O-Level) or interview (A-Level). Dates are communicated by SMS and email at least one week in advance.',
          published: true,
        },
        {
          stepNumber: 5,
          title: 'Admission Decision',
          description:
            'The Admissions Committee reviews applications based on merit, available places, and conduct records. Results are published on the school notice board and sent to parents within 14 working days.',
          published: true,
        },
        {
          stepNumber: 6,
          title: 'Registration & Enrollment',
          description:
            'Successful applicants pay the registration fee, submit medical forms, and receive their class placement and student ID. Enrollment must be completed before the first day of term.',
          published: true,
        },
      ],
    });
  }

  const reqCount = await prisma.admissionRequirement.count();
  if (reqCount === 0) {
    await prisma.admissionRequirement.createMany({
      data: [
        {
          category: 'Eligibility',
          title: 'Age requirements',
          description: 'Primary P1: minimum age 6 by 31 December of entry year. O-Level S1: completion of Primary 6. A-Level S4: completion of O-Level with passing grades.',
          level: 'All levels',
          order: 1,
          published: true,
        },
        {
          category: 'Eligibility',
          title: 'Previous school records',
          description: 'Students transferring from another school must provide a transfer letter and latest report card with no outstanding disciplinary issues.',
          level: 'O-Level & A-Level',
          order: 2,
          published: true,
        },
        {
          category: 'Documents',
          title: 'Birth certificate (copy)',
          description: 'Certified copy of birth certificate or national ID for students aged 16 and above.',
          level: 'All levels',
          order: 1,
          published: true,
        },
        {
          category: 'Documents',
          title: 'Recent passport photos',
          description: 'Two (2) passport-size photographs, white background, taken within the last 6 months.',
          level: 'All levels',
          order: 2,
          published: true,
        },
        {
          category: 'Documents',
          title: 'Report cards / transcripts',
          description: 'Last two academic years report cards. A-Level applicants must include O-Level national exam results (REB) where applicable.',
          level: 'O-Level & A-Level',
          order: 3,
          published: true,
        },
        {
          category: 'Documents',
          title: 'Parent/Guardian ID',
          description: 'Copy of parent or legal guardian national ID or passport.',
          level: 'All levels',
          order: 4,
          published: true,
        },
        {
          category: 'Documents',
          title: 'Medical certificate',
          description: 'Health certificate from a licensed clinic issued within 3 months of application.',
          level: 'All levels',
          order: 5,
          published: true,
        },
        {
          category: 'Assessment',
          title: 'Entrance examination',
          description: 'Covers Mathematics, English, and Kinyarwanda for Primary and O-Level applicants. A-Level candidates may sit subject-specific tests.',
          level: 'Primary & O-Level',
          order: 1,
          published: true,
        },
        {
          category: 'Assessment',
          title: 'Code of conduct agreement',
          description: 'Parents and students must sign the school discipline and ICT acceptable-use policy before enrollment.',
          level: 'All levels',
          order: 2,
          published: true,
        },
      ],
    });
  }

  const feeCount = await prisma.admissionFee.count();
  if (feeCount === 0) {
    await prisma.admissionFee.createMany({
      data: [
        {
          level: 'Primary (P1–P6)',
          amount: '15,000 RWF',
          description: 'Non-refundable registration fee upon acceptance',
          order: 1,
          published: true,
        },
        {
          level: 'Ordinary Level (S1–S3)',
          amount: '25,000 RWF',
          description: 'Includes application processing and entrance assessment',
          order: 2,
          published: true,
        },
        {
          level: 'Advanced Level (S4–S6)',
          amount: '30,000 RWF',
          description: 'Registration fee; tuition fees communicated separately per combination',
          order: 3,
          published: true,
        },
      ],
    });
  }

  const faqCount = await prisma.admissionFaq.count();
  if (faqCount === 0) {
    await prisma.admissionFaq.createMany({
      data: [
        {
          question: 'When does the application period open?',
          answer:
            'Applications typically open in May for the academic year starting in September. Check the deadline notice on this page or contact the Admissions Office for exact dates.',
          order: 1,
          published: true,
        },
        {
          question: 'Can I apply if I am transferring from another school?',
          answer:
            'Yes. Transfer students must submit a transfer letter from their previous school, latest report cards, and meet our conduct and academic standards.',
          order: 2,
          published: true,
        },
        {
          question: 'Is there an entrance exam for all levels?',
          answer:
            'Primary and O-Level applicants sit an entrance assessment. A-Level applicants may have interviews and subject-specific evaluations depending on their combination.',
          order: 3,
          published: true,
        },
        {
          question: 'How long does the admission decision take?',
          answer:
            'Decisions are communicated within 14 working days after the assessment period. You will receive results by SMS, email, and notice on the school board.',
          order: 4,
          published: true,
        },
        {
          question: 'Are registration fees refundable?',
          answer:
            'Registration fees are non-refundable once enrollment is confirmed. Fees cover administrative processing only; tuition is billed separately per term.',
          order: 5,
          published: true,
        },
        {
          question: 'Does the school offer boarding?',
          answer:
            'Contact the Admissions Office for current boarding availability, fees, and waiting list status. Day and boarding options may vary by level.',
          order: 6,
          published: true,
        },
      ],
    });
  }

  console.log('Seed completed.');
  console.log('Admin login: admin@schoolhuye.rw / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
