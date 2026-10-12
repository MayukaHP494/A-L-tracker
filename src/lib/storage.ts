import {
  UserProfile,
  PaperRecord,
  PaperSubmission,
  TopicItem,
  HomeworkTask,
  StudySession,
  WeeklyGoal,
  AppSettings,
  InAppNotification,
  SubjectId,
  SubjectInfo,
} from '../types/index.ts';

export const DEFAULT_SUBJECTS: SubjectInfo[] = [
  {
    id: 'combined_maths',
    name: 'Combined Mathematics',
    sinhalaName: 'සංයුක්ත ගණිතය',
    color: '#2563EB', // blue-600
    targetPercentage: 75,
  },
  {
    id: 'physics',
    name: 'Physics',
    sinhalaName: 'භෞතික විද්‍යාව',
    color: '#4F46E5', // indigo-600
    targetPercentage: 75,
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    sinhalaName: 'රසායන විද්‍යාව',
    color: '#0891B2', // cyan-600
    targetPercentage: 75,
  },
];

export const INITIAL_TOPICS: TopicItem[] = [
  // ================= Combined Mathematics =================
  // Pure Mathematics (ශුද්ධ ගණිතය)
  {
    id: 'cm_pure_real_numbers',
    subjectId: 'combined_maths',
    name: 'Real Numbers & Polynomials',
    sinhalaName: 'තාත්වික සංඛ්‍යා සහ බහුපද',
    unitOrLesson: 'Pure Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s1', name: 'Real Number System & Properties', sinhalaName: 'තාත්වික සංඛ්‍යා පද්ධතිය' },
      { id: 'cm_s2', name: 'Polynomial Division & Remainder Theorem', sinhalaName: 'ශේෂ ප්‍රමේයය' },
      { id: 'cm_s3', name: 'Factor Theorem & Factorization', sinhalaName: 'සාධක ප්‍රමේයය' },
    ],
  },
  {
    id: 'cm_pure_rational_fractions',
    subjectId: 'combined_maths',
    name: 'Rational Functions & Partial Fractions',
    sinhalaName: 'භාගික ශ්‍රිත සහ ආංශික භාග',
    unitOrLesson: 'Pure Mathematics',
    priority: 'medium',
    sections: [
      { id: 'cm_s4', name: 'Linear Non-Repeated Factors', sinhalaName: 'ඒකජ සාධක' },
      { id: 'cm_s5', name: 'Repeated Linear Factors', sinhalaName: 'පුනරාවර්තී ඒකජ සාධක' },
      { id: 'cm_s6', name: 'Irreducible Quadratic Factors', sinhalaName: 'වර්ගජ සාධක' },
    ],
  },
  {
    id: 'cm_pure_quadratics',
    subjectId: 'combined_maths',
    name: 'Quadratic Functions & Equations',
    sinhalaName: 'වර්ගජ ශ්‍රිත සහ සමීකරණ',
    unitOrLesson: 'Pure Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s7', name: 'Roots of Quadratic Equations', sinhalaName: 'මූලවල ගුණ' },
      { id: 'cm_s8', name: 'Discriminant & Nature of Roots', sinhalaName: 'විවේචකය සහ මූලවල ස්වභාවය' },
      { id: 'cm_s9', name: 'Quadratic Graphs & Inequalities', sinhalaName: 'වර්ගජ ප්‍රස්ථාර සහ අසමානතා' },
    ],
  },
  {
    id: 'cm_pure_induction_binomial',
    subjectId: 'combined_maths',
    name: 'Mathematical Induction & Binomial Theorem',
    sinhalaName: 'ගණිත අභ්‍යුහනය සහ ද්විපද ප්‍රමේයය',
    unitOrLesson: 'Pure Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s10', name: 'Principle of Mathematical Induction', sinhalaName: 'ගණිත අභ්‍යුහන මූලධර්මය' },
      { id: 'cm_s11', name: 'Binomial Expansion for Positive Integral Index', sinhalaName: 'ද්විපද ප්‍රසාරණය' },
      { id: 'cm_s12', name: 'General Term & Coefficients', sinhalaName: 'සාධාරණ පදය සහ සංගුණක' },
    ],
  },
  {
    id: 'cm_pure_logarithms',
    subjectId: 'combined_maths',
    name: 'Logarithms & Indices',
    sinhalaName: 'ලඝුගණක සහ දර්ශක',
    unitOrLesson: 'Pure Mathematics',
    priority: 'medium',
    sections: [
      { id: 'cm_s13', name: 'Laws of Indices & Exponential Equations', sinhalaName: 'දර්ශක නීති' },
      { id: 'cm_s14', name: 'Properties and Laws of Logarithms', sinhalaName: 'ලඝුගණක නීති' },
      { id: 'cm_s15', name: 'Change of Base Rule', sinhalaName: 'පාද විපර්යාසය' },
    ],
  },
  {
    id: 'cm_pure_trig',
    subjectId: 'combined_maths',
    name: 'Trigonometric Functions & Equations',
    sinhalaName: 'ත්‍රිකෝණමිතික ශ්‍රිත සහ සමීකරණ',
    unitOrLesson: 'Pure Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s16', name: 'Compound & Double Angle Formulae', sinhalaName: 'සංයුක්ත හා ද්විත්ව කෝණ' },
      { id: 'cm_s17', name: 'Factor Formulae', sinhalaName: 'ගුණිත-එකතු සූත්‍ර' },
      { id: 'cm_s18', name: 'General Solutions of Trigonometric Equations', sinhalaName: 'සාධාරණ විසඳුම්' },
      { id: 'cm_s19', name: 'Sine and Cosine Rules for Triangles', sinhalaName: 'සයින් සහ කොසයින් නීති' },
    ],
  },
  {
    id: 'cm_pure_calc',
    subjectId: 'combined_maths',
    name: 'Limits and Differentiation',
    sinhalaName: 'සීමා සහ අවකලනය',
    unitOrLesson: 'Pure Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s20', name: 'Standard Limits & Continuity', sinhalaName: 'සීමා සහ සන්තතිකතාව' },
      { id: 'cm_s21', name: 'Differentiation from First Principles', sinhalaName: 'මූලධර්ම මඟින් අවකලනය' },
      { id: 'cm_s22', name: 'Chain, Product, and Quotient Rules', sinhalaName: 'දාම, ගුණිත, සහ බෙදුම් නීති' },
      { id: 'cm_s23', name: 'Tangents, Normals & Turning Points', sinhalaName: 'ස්පර්ශක, අභිලම්භ සහ හැරවුම් ලක්ෂ්‍ය' },
    ],
  },
  {
    id: 'cm_pure_integration',
    subjectId: 'combined_maths',
    name: 'Integration',
    sinhalaName: 'අනුකලනය',
    unitOrLesson: 'Pure Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s24', name: 'Standard Integrals', sinhalaName: 'සම්මත අනුකල' },
      { id: 'cm_s25', name: 'Integration by Substitution', sinhalaName: 'ආදේශයෙන් අනුකලනය' },
      { id: 'cm_s26', name: 'Integration by Parts', sinhalaName: 'කොටස් වශයෙන් අනුකලනය' },
      { id: 'cm_s27', name: 'Definite Integrals & Areas', sinhalaName: 'නියත අනුකල සහ වර්ගඵල' },
    ],
  },
  {
    id: 'cm_pure_straight_line',
    subjectId: 'combined_maths',
    name: 'Straight Line',
    sinhalaName: 'සරල රේඛාව',
    unitOrLesson: 'Pure Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s28', name: 'Gradient, Intercept & Equations of Lines', sinhalaName: 'අනුක්‍රමණය සහ රේඛා සමීකරණ' },
      { id: 'cm_s29', name: 'Angle Between Two Lines', sinhalaName: 'රේඛා දෙකක් අතර කෝණය' },
      { id: 'cm_s30', name: 'Perpendicular Distance of a Point', sinhalaName: 'ලක්ෂ්‍යයක ලම්බ දුර' },
      { id: 'cm_s31', name: 'Pairs of Straight Lines', sinhalaName: 'සරල රේඛා යුගල' },
    ],
  },
  {
    id: 'cm_pure_circle',
    subjectId: 'combined_maths',
    name: 'Circle',
    sinhalaName: 'වෘත්තය',
    unitOrLesson: 'Pure Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s32', name: 'General Equation of a Circle', sinhalaName: 'වෘත්තයේ සාධාරණ සමීකරණය' },
      { id: 'cm_s33', name: 'Tangents and Normals to a Circle', sinhalaName: 'ස්පර්ශක සහ අභිලම්භ' },
      { id: 'cm_s34', name: 'Orthogonal & Intersecting Circles', sinhalaName: 'ලම්බක සහ ඡේදනය වන වෘත්ත' },
    ],
  },
  {
    id: 'cm_pure_complex_numbers',
    subjectId: 'combined_maths',
    name: 'Complex Numbers',
    sinhalaName: 'සංකීර්ණ සංඛ්‍යා',
    unitOrLesson: 'Pure Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s35', name: 'Argand Diagram & Modulus-Argument Form', sinhalaName: 'ආගන්ඩ් සටහන සහ මාපාංකය-විස්තාරය' },
      { id: 'cm_s36', name: "De Moivre's Theorem", sinhalaName: 'ද මෝවාගේ ප්‍රමේයය' },
      { id: 'cm_s37', name: 'Roots of Complex Numbers', sinhalaName: 'මූල සෙවීම' },
    ],
  },
  {
    id: 'cm_pure_matrices',
    subjectId: 'combined_maths',
    name: 'Matrices and Determinants',
    sinhalaName: 'න්‍යාස සහ නිශ්චායක',
    unitOrLesson: 'Pure Mathematics',
    priority: 'medium',
    sections: [
      { id: 'cm_s38', name: 'Matrix Operations & Multiplication', sinhalaName: 'න්‍යාස ගුණිතය' },
      { id: 'cm_s39', name: 'Determinants of 2x2 and 3x3 Matrices', sinhalaName: 'නිශ්චායක' },
      { id: 'cm_s40', name: 'Inverse Matrix & Linear Equations', sinhalaName: 'ප්‍රතිලෝම න්‍යාසය' },
    ],
  },

  // Applied Mathematics (ප්‍රායෝගික ගණිතය)
  {
    id: 'cm_app_vectors',
    subjectId: 'combined_maths',
    name: 'Vectors',
    sinhalaName: 'දෛශික',
    unitOrLesson: 'Applied Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s41', name: 'Addition, Subtraction & Resolution', sinhalaName: 'දෛශික විභේදනය' },
      { id: 'cm_s42', name: 'Scalar (Dot) Product', sinhalaName: 'තිත් ගුණිතය' },
      { id: 'cm_s43', name: 'Vector (Cross) Product', sinhalaName: 'කතිර ගුණිතය' },
    ],
  },
  {
    id: 'cm_app_coplanar_forces',
    subjectId: 'combined_maths',
    name: 'Coplanar Forces & Equilibrium',
    sinhalaName: 'ඒකතල බල සහ සමතුලිතතාව',
    unitOrLesson: 'Applied Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s44', name: 'Resultant of Concurrent & Parallel Forces', sinhalaName: 'සම්ප්‍රයුක්ත බලය' },
      { id: 'cm_s45', name: 'Moments and Couples', sinhalaName: 'ඝූර්ණ සහ යුග්ම' },
      { id: 'cm_s46', name: 'Equilibrium Conditions for Rigid Bodies', sinhalaName: 'දෘඪ වස්තු සමතුලිතතාව' },
    ],
  },
  {
    id: 'cm_app_friction',
    subjectId: 'combined_maths',
    name: 'Friction',
    sinhalaName: 'ඝර්ෂණය',
    unitOrLesson: 'Applied Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s47', name: 'Laws of Friction & Limiting Equilibrium', sinhalaName: 'සීමාකාරී ඝර්ෂණය' },
      { id: 'cm_s48', name: 'Motion on Rough Inclined Planes', sinhalaName: 'රළු ආනත තල' },
    ],
  },
  {
    id: 'cm_app_centre_of_gravity',
    subjectId: 'combined_maths',
    name: 'Centre of Gravity',
    sinhalaName: 'ගුරුත්ව කේන්ද්‍රය',
    unitOrLesson: 'Applied Mathematics',
    priority: 'medium',
    sections: [
      { id: 'cm_s49', name: 'Standard Bodies (Wires, Laminae)', sinhalaName: 'සම්මත වස්තු' },
      { id: 'cm_s50', name: 'Composite Bodies & Remainders', sinhalaName: 'සංයුක්ත වස්තු' },
    ],
  },
  {
    id: 'cm_app_frameworks',
    subjectId: 'combined_maths',
    name: 'Frameworks / Trusses',
    sinhalaName: 'දඬු රාමු',
    unitOrLesson: 'Applied Mathematics',
    priority: 'medium',
    sections: [
      { id: 'cm_s51', name: 'Joint Equilibrium Method', sinhalaName: 'සන්ධි ක්‍රමය' },
      { id: 'cm_s52', name: 'Light Rods in Tension and Thrust', sinhalaName: 'තෙරපුම සහ ආතතිය' },
    ],
  },
  {
    id: 'cm_app_straight_line_motion',
    subjectId: 'combined_maths',
    name: 'Straight-Line Motion (Kinematics)',
    sinhalaName: 'සරල රේඛීය චලිතය',
    unitOrLesson: 'Applied Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s53', name: 'Velocity-Time (v-t) Graphs', sinhalaName: 'ප්‍රවේග-කාල ප්‍රස්ථාර' },
      { id: 'cm_s54', name: 'Equations of Uniform Acceleration', sinhalaName: 'චලිත සමීකරණ' },
      { id: 'cm_s55', name: 'Vertical Motion under Gravity', sinhalaName: 'ගුරුත්වය යටතේ සිරස් චලිතය' },
    ],
  },
  {
    id: 'cm_app_projectiles',
    subjectId: 'combined_maths',
    name: 'Projectiles',
    sinhalaName: 'ප්‍රක්ෂිප්ත චලිතය',
    unitOrLesson: 'Applied Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s56', name: 'Trajectory on Horizontal Ground', sinhalaName: 'තිරස් තලයක ප්‍රක්ෂිප්තය' },
      { id: 'cm_s57', name: 'Projection on Inclined Planes', sinhalaName: 'ආනත තලයක ප්‍රක්ෂිප්තය' },
      { id: 'cm_s58', name: 'Maximum Range & Time of Flight', sinhalaName: 'උපරිම පරාසය සහ පියාසර කාලය' },
    ],
  },
  {
    id: 'cm_app_relative_velocity',
    subjectId: 'combined_maths',
    name: 'Relative Velocity',
    sinhalaName: 'සාපේක්ෂ ප්‍රවේගය',
    unitOrLesson: 'Applied Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s59', name: 'Relative Velocity Triangle', sinhalaName: 'සාපේක්ෂ ප්‍රවේග ත්‍රිකෝණය' },
      { id: 'cm_s60', name: 'Shortest Distance of Approach', sinhalaName: 'කෙටිම දුර' },
      { id: 'cm_s61', name: 'Interception of Moving Objects', sinhalaName: 'හමුවීම සහ අවහිර කිරීම' },
    ],
  },
  {
    id: 'cm_app_newtons_laws',
    subjectId: 'combined_maths',
    name: "Newton's Laws & Work-Energy-Power",
    sinhalaName: 'නිව්ටන් නියම සහ කාර්යය-ශක්තිය-ක්ෂමතාව',
    unitOrLesson: 'Applied Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s62', name: 'Connected Particles & Pulleys', sinhalaName: 'කප්පි සහ සම්බන්ධිත අංශු' },
      { id: 'cm_s63', name: 'Conservation of Linear Momentum & Impulse', sinhalaName: 'ගම්‍යතා සංස්ථිතිය සහ ආවේගය' },
      { id: 'cm_s64', name: 'Work-Energy Principle & Power', sinhalaName: 'කාර්යය-ශක්ති මූලධර්මය සහ ක්ෂමතාව' },
    ],
  },
  {
    id: 'cm_app_circular_motion',
    subjectId: 'combined_maths',
    name: 'Circular Motion',
    sinhalaName: 'වෘත්ත චලිතය',
    unitOrLesson: 'Applied Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s65', name: 'Horizontal Circular Motion & Conical Pendulum', sinhalaName: 'තිරස් වෘත්ත චලිතය' },
      { id: 'cm_s66', name: 'Vertical Circular Motion & Energy Conservation', sinhalaName: 'සිරස් වෘත්ත චලිතය' },
    ],
  },
  {
    id: 'cm_app_shm',
    subjectId: 'combined_maths',
    name: 'Simple Harmonic Motion (SHM)',
    sinhalaName: 'සරල අනුවර්තී චලිතය',
    unitOrLesson: 'Applied Mathematics',
    priority: 'high',
    sections: [
      { id: 'cm_s67', name: "Hooke's Law for Elastic Strings & Springs", sinhalaName: 'හුක්ගේ නියමය' },
      { id: 'cm_s68', name: 'Horizontal & Vertical Oscillations', sinhalaName: 'තිරස් සහ සිරස් දෝලන' },
    ],
  },
  {
    id: 'cm_app_probability_stats',
    subjectId: 'combined_maths',
    name: 'Probability and Statistics',
    sinhalaName: 'සම්භාවිතාව සහ සංඛ්‍යානය',
    unitOrLesson: 'Applied Mathematics',
    priority: 'medium',
    sections: [
      { id: 'cm_s69', name: 'Permutations and Combinations', sinhalaName: 'ක්‍රමාරෝප සහ සංයෝජන' },
      { id: 'cm_s70', name: "Conditional Probability & Bayes' Rule", sinhalaName: 'සම්භාවිතා නීති' },
      { id: 'cm_s71', name: 'Measures of Dispersion & Standard Deviation', sinhalaName: 'විචලතාව සහ සම්මත අපගමනය' },
    ],
  },

  // ================= Physics (භෞතික විද්‍යාව) =================
  {
    id: 'phy_unit1_measurement',
    subjectId: 'physics',
    name: 'Measurement & Units',
    sinhalaName: 'මිනුම් සහ ඒකක',
    unitOrLesson: 'Unit 1: Measurement',
    priority: 'medium',
    sections: [
      { id: 'phy_s1', name: 'SI Units, Dimensions & Dimensional Analysis', sinhalaName: 'මාන විශ්ලේෂණය' },
      { id: 'phy_s2', name: 'Errors, Vernier Caliper & Micrometer', sinhalaName: 'දෝෂ සහ උපකරණ' },
      { id: 'phy_s3', name: 'Spherometer & Travelling Microscope', sinhalaName: 'ගෝලමානය සහ සංචාරක අන්වීක්ෂය' },
    ],
  },
  {
    id: 'phy_unit2_mechanics',
    subjectId: 'physics',
    name: 'Mechanics & Dynamics',
    sinhalaName: 'යාන්ත්‍ර විද්‍යාව',
    unitOrLesson: 'Unit 2: Mechanics',
    priority: 'high',
    sections: [
      { id: 'phy_s4', name: 'Linear Motion, Momentum & Collisions', sinhalaName: 'ගම්‍යතාව සහ ගැටුම්' },
      { id: 'phy_s5', name: 'Circular Motion & Centripetal Acceleration', sinhalaName: 'වෘත්ත චලිතය' },
      { id: 'phy_s6', name: 'Rotational Dynamics & Moment of Inertia', sinhalaName: 'භ්‍රමණ ගතිකය සහ අවස්ථිති ඝූර්ණය' },
      { id: 'phy_s7', name: 'Hydrostatics, U-tubes & Archimedes Principle', sinhalaName: 'ද්‍රවස්ථිති විද්‍යාව' },
    ],
  },
  {
    id: 'phy_unit3_oscillations_waves',
    subjectId: 'physics',
    name: 'Oscillations and Waves',
    sinhalaName: 'දෝලන සහ තරංග',
    unitOrLesson: 'Unit 3: Oscillations & Waves',
    priority: 'high',
    sections: [
      { id: 'phy_s8', name: 'Simple Harmonic Motion (SHM) Equations', sinhalaName: 'සරල අනුවර්තී චලිතය' },
      { id: 'phy_s9', name: 'Sound Waves, Resonance & Sonometer', sinhalaName: 'ධ්වනිය සහ අනුනාදය' },
      { id: 'phy_s10', name: 'Doppler Effect', sinhalaName: 'ඩොප්ලර් ආචරණය' },
      { id: 'phy_s11', name: 'Wave Optics: Interference & Diffraction', sinhalaName: 'ආලෝක තරංග සහ නිරෝධනය' },
    ],
  },
  {
    id: 'phy_unit4_thermal',
    subjectId: 'physics',
    name: 'Thermal Physics',
    sinhalaName: 'තාප භෞතික විද්‍යාව',
    unitOrLesson: 'Unit 4: Thermal Physics',
    priority: 'high',
    sections: [
      { id: 'phy_s12', name: 'Thermometry & Thermal Expansion', sinhalaName: 'උෂ්ණත්වමිතිය සහ ප්‍රසාරණය' },
      { id: 'phy_s13', name: 'Calorimetry & Specific Heat Capacity', sinhalaName: 'කැලරිමිතිය' },
      { id: 'phy_s14', name: 'Thermal Conduction, Convection & Radiation', sinhalaName: 'තාප සම්ප්‍රේෂණය' },
      { id: 'phy_s15', name: 'First Law of Thermodynamics & Ideal Gas Laws', sinhalaName: 'තාපගති විද්‍යාව' },
    ],
  },
  {
    id: 'phy_unit5_fields',
    subjectId: 'physics',
    name: 'Gravitational, Electrostatic & Magnetic Fields',
    sinhalaName: 'ක්ෂේත්‍ර (ගුරුත්වාකර්ෂණ, විද්‍යුත්, චුම්භක)',
    unitOrLesson: 'Unit 5: Fields',
    priority: 'high',
    sections: [
      { id: 'phy_s16', name: 'Gravitational Field & Satellite Orbits', sinhalaName: 'ගුරුත්වාකර්ෂණ ක්ෂේත්‍රය' },
      { id: 'phy_s17', name: 'Electric Field, Potential & Capacitors', sinhalaName: 'විද්‍යුත් ක්ෂේත්‍රය සහ ධාරිත්‍රක' },
      { id: 'phy_s18', name: "Magnetic Field, Ampere's Law & Induction", sinhalaName: 'විද්‍යුත් චුම්භක ප්‍රේරණය' },
    ],
  },
  {
    id: 'phy_unit6_current_electricity',
    subjectId: 'physics',
    name: 'Current Electricity & Circuits',
    sinhalaName: 'ධාරා විද්‍යුතය සහ පරිපථ',
    unitOrLesson: 'Unit 6: Current Electricity',
    priority: 'high',
    sections: [
      { id: 'phy_s19', name: "Ohm's Law, Resistivity & Temperature Effect", sinhalaName: 'ඕම්ගේ නියමය සහ ප්‍රතිරෝධය' },
      { id: 'phy_s20', name: "Kirchhoff's Laws & Network Analysis", sinhalaName: 'කර්චොෆ්ගේ නීති' },
      { id: 'phy_s21', name: 'Potentiometer & Meter Bridge', sinhalaName: 'විභවමානය සහ මීටර් සේතුව' },
    ],
  },
  {
    id: 'phy_unit7_electronics',
    subjectId: 'physics',
    name: 'Electronics & Logic Gates',
    sinhalaName: 'ඉලෙක්ට්‍රොනික විද්‍යාව',
    unitOrLesson: 'Unit 7: Electronics',
    priority: 'medium',
    sections: [
      { id: 'phy_s22', name: 'Semiconductor Diodes & Rectification', sinhalaName: 'ඩයෝඩ සහ සෘජුකරණය' },
      { id: 'phy_s23', name: 'Bipolar Junction Transistors', sinhalaName: 'ට්‍රාන්සිස්ටර' },
      { id: 'phy_s24', name: 'Operational Amplifiers (Op-Amps)', sinhalaName: 'ක්‍රියාකාරී වර්ධක' },
      { id: 'phy_s25', name: 'Logic Gates & Truth Tables', sinhalaName: 'තර්ක ද්වාර' },
    ],
  },
  {
    id: 'phy_unit8_properties_of_matter',
    subjectId: 'physics',
    name: 'Mechanical Properties of Matter',
    sinhalaName: 'ද්‍රව්‍යවල යාන්ත්‍රික ගුණ',
    unitOrLesson: 'Unit 8: Mechanical Properties',
    priority: 'high',
    sections: [
      { id: 'phy_s26', name: "Elasticity & Young's Modulus", sinhalaName: 'ප්‍රත්‍යාස්ථතාව සහ යං මාපාංකය' },
      { id: 'phy_s27', name: "Viscosity & Poiseuille's Law", sinhalaName: 'දුස්ස්‍රාවිතාව' },
      { id: 'phy_s28', name: 'Surface Tension & Capillary Action', sinhalaName: 'පෘෂ්ඨික ආතතිය' },
    ],
  },
  {
    id: 'phy_unit9_matter_radiation',
    subjectId: 'physics',
    name: 'Matter and Radiation',
    sinhalaName: 'පදාර්ථය සහ විකිරණ',
    unitOrLesson: 'Unit 9: Matter & Radiation',
    priority: 'high',
    sections: [
      { id: 'phy_s29', name: 'Photoelectric Effect & Quantum Nature', sinhalaName: 'ප්‍රකාශ විද්‍යුත් ආචරණය' },
      { id: 'phy_s30', name: 'X-rays & Wave-Particle Duality', sinhalaName: 'X-කිරණ' },
      { id: 'phy_s31', name: 'Radioactivity & Nuclear Reactions', sinhalaName: 'විකිරණශීලීතාව සහ න්‍යෂ්ටික ශක්තිය' },
    ],
  },

  // ================= Chemistry (රසායන විද්‍යාව) =================
  {
    id: 'chem_unit1_atomic_structure',
    subjectId: 'chemistry',
    name: 'Atomic Structure',
    sinhalaName: 'පරමාණුක ව්‍යුහය',
    unitOrLesson: 'Unit 1: Atomic Structure',
    priority: 'medium',
    sections: [
      { id: 'chem_s1', name: 'Subatomic Particles & Isotopes', sinhalaName: 'උප පරමාණුක අංශු' },
      { id: 'chem_s2', name: 'Electromagnetic Spectrum & Bohr Model', sinhalaName: 'බෝර් ආකෘතිය' },
      { id: 'chem_s3', name: 'Quantum Numbers & Electronic Configuration', sinhalaName: 'ක්වොන්ටම් අංක' },
    ],
  },
  {
    id: 'chem_unit2_bonding_structure',
    subjectId: 'chemistry',
    name: 'Chemical Bonding & Structure',
    sinhalaName: 'රසායනික බන්ධන සහ ව්‍යුහය',
    unitOrLesson: 'Unit 2: Bonding & Structure',
    priority: 'high',
    sections: [
      { id: 'chem_s4', name: 'Ionic, Covalent & Metallic Bonding', sinhalaName: 'බන්ධන වර්ග' },
      { id: 'chem_s5', name: 'VSEPR Theory & Molecular Shapes', sinhalaName: 'VSEPR න්‍යාය සහ අණුක හැඩ' },
      { id: 'chem_s6', name: 'Hybridization & Resonance', sinhalaName: 'මුහුම්කරණය සහ අනුනාදය' },
      { id: 'chem_s7', name: 'Intermolecular Forces & Hydrogen Bonds', sinhalaName: 'අන්තර් අණුක ආකර්ෂණ' },
    ],
  },
  {
    id: 'chem_unit3_calculations',
    subjectId: 'chemistry',
    name: 'Chemical Calculations & Stoichiometry',
    sinhalaName: 'රසායනික ගණනය කිරීම් (මවුල සංකල්පය)',
    unitOrLesson: 'Unit 3: Calculations',
    priority: 'high',
    sections: [
      { id: 'chem_s8', name: 'Mole Concept & Empirical Formulae', sinhalaName: 'මවුල සංකල්පය' },
      { id: 'chem_s9', name: 'Solution Concentrations & Dilutions', sinhalaName: 'ද්‍රාවණ සාන්ද්‍රණ' },
      { id: 'chem_s10', name: 'Volumetric Titrations (Acid-Base, Redox)', sinhalaName: 'පරිමාමිතික අනුමාපන' },
    ],
  },
  {
    id: 'chem_unit4_gaseous_state',
    subjectId: 'chemistry',
    name: 'Gaseous State of Matter',
    sinhalaName: 'පදාර්ථයේ වායුමය අවස්ථාව',
    unitOrLesson: 'Unit 4: Gaseous State',
    priority: 'high',
    sections: [
      { id: 'chem_s11', name: 'Ideal Gas Laws (PV=nRT)', sinhalaName: 'පරිපූර්ණ වායු නීති' },
      { id: 'chem_s12', name: "Dalton's Law of Partial Pressures", sinhalaName: 'ඩෝල්ටන්ගේ ආංශික පීඩන නියමය' },
      { id: 'chem_s13', name: 'Kinetic Theory & Real Gas Behavior', sinhalaName: 'චාලක වායු න්‍යාය' },
    ],
  },
  {
    id: 'chem_unit5_energetics',
    subjectId: 'chemistry',
    name: 'Energetics & Thermochemistry',
    sinhalaName: 'ශක්ති විද්‍යාව (තාප රසායනය)',
    unitOrLesson: 'Unit 5: Energetics',
    priority: 'high',
    sections: [
      { id: 'chem_s14', name: 'Enthalpy Changes of Reaction & Formation', sinhalaName: 'එන්තැල්පි විපර්යාස' },
      { id: 'chem_s15', name: "Hess's Law & Enthalpy Cycles", sinhalaName: 'හෙසස් නියමය' },
      { id: 'chem_s16', name: 'Born-Haber Cycles & Lattice Energy', sinhalaName: 'බෝන්-හාබර් චක්‍රය' },
    ],
  },
  {
    id: 'chem_unit6_inorganic_elements',
    subjectId: 'chemistry',
    name: 'Chemistry of Elements (s, p, d Blocks)',
    sinhalaName: 'මූලද්‍රව්‍යවල රසායනය (s, p, d ගොනු)',
    unitOrLesson: 'Unit 6: Inorganic Chemistry',
    priority: 'high',
    sections: [
      { id: 'chem_s17', name: 's-Block Elements (Group 1 & 2)', sinhalaName: '1 සහ 2 කාණ්ඩ' },
      { id: 'chem_s18', name: 'p-Block Elements (Group 13 to 17)', sinhalaName: 'p-ගොනුවේ මූලද්‍රව්‍ය' },
      { id: 'chem_s19', name: 'Nitrogen, Phosphorus & Sulfur Chemistry', sinhalaName: 'නයිට්‍රජන්, පොස්පරස්, සල්ෆර්' },
      { id: 'chem_s20', name: 'd-Block Transition Metal Complexes', sinhalaName: 'සංක්‍රාන්ති මූලද්‍රව්‍ය' },
    ],
  },
  {
    id: 'chem_unit7_organic_basics',
    subjectId: 'chemistry',
    name: 'Basic Principles of Organic Chemistry & Hydrocarbons',
    sinhalaName: 'කාබනික රසායනයේ මූලධර්ම සහ හයිඩ්‍රොකාබන',
    unitOrLesson: 'Unit 7: Organic Principles & Hydrocarbons',
    priority: 'high',
    sections: [
      { id: 'chem_s21', name: 'IUPAC Nomenclature & Isomerism', sinhalaName: 'IUPAC නාමකරණය සහ සමාවයවිකතාව' },
      { id: 'chem_s22', name: 'Alkanes & Free Radical Substitution', sinhalaName: 'ඇල්කේන' },
      { id: 'chem_s23', name: 'Alkenes, Electrophilic Addition & Markovnikov Rule', sinhalaName: 'ඇල්කීන' },
      { id: 'chem_s24', name: 'Alkynes & Benzene Aromatic Substitution', sinhalaName: 'ඇල්කයින සහ බෙන්සීන්' },
    ],
  },
  {
    id: 'chem_unit8_organic_derivatives',
    subjectId: 'chemistry',
    name: 'Alkyl Halides, Oxygen & Nitrogen Derivatives',
    sinhalaName: 'හේලයිඩ, ඔක්සිජන් සහ නයිට්‍රජන් කාබනික සංයෝග',
    unitOrLesson: 'Unit 8: Organic Derivatives',
    priority: 'high',
    sections: [
      { id: 'chem_s25', name: 'Alkyl Halides (SN1, SN2 & Elimination)', sinhalaName: 'ඇල්කයිල් හේලයිඩ' },
      { id: 'chem_s26', name: 'Alcohols, Phenols & Ethers', sinhalaName: 'ඇල්කොහොල් සහ ෆීනෝල්' },
      { id: 'chem_s27', name: 'Aldehydes & Ketones (Nucleophilic Addition)', sinhalaName: 'ඇල්ඩිහයිඩ සහ කීටෝන' },
      { id: 'chem_s28', name: 'Carboxylic Acids, Esters & Amines', sinhalaName: 'කාබොක්සිලික් අම්ල සහ ඇමීන' },
    ],
  },
  {
    id: 'chem_unit9_kinetics',
    subjectId: 'chemistry',
    name: 'Chemical Kinetics',
    sinhalaName: 'රසායනික චාලක විද්‍යාව',
    unitOrLesson: 'Unit 9: Chemical Kinetics',
    priority: 'high',
    sections: [
      { id: 'chem_s29', name: 'Reaction Rates & Rate Equations', sinhalaName: 'ප්‍රතික්‍රියා ශීඝ්‍රතාව' },
      { id: 'chem_s30', name: 'Order of Reaction & Half-Life', sinhalaName: 'ප්‍රතික්‍රියා පෙළ සහ අර්ධ ආයු කාලය' },
      { id: 'chem_s31', name: 'Catalysis & Arrhenius Equation', sinhalaName: 'උත්ප්‍රේරණය' },
    ],
  },
  {
    id: 'chem_unit10_equilibrium',
    subjectId: 'chemistry',
    name: 'Chemical Equilibrium & Ionic Systems',
    sinhalaName: 'රසායනික සමතුලිතතාව සහ අයනික පද්ධති',
    unitOrLesson: 'Unit 10: Chemical Equilibrium',
    priority: 'high',
    sections: [
      { id: 'chem_s32', name: 'Homogeneous & Heterogeneous Equilibrium (Kc, Kp)', sinhalaName: 'සමතුලිත නියත' },
      { id: 'chem_s33', name: "Le Chatelier's Principle", sinhalaName: 'ලෙ ෂැටලියර්ගේ මූලධර්මය' },
      { id: 'chem_s34', name: 'pH, Buffer Solutions & Solubility Product (Ksp)', sinhalaName: 'අයනික සමතුලිතතාව සහ බෆර' },
    ],
  },
  {
    id: 'chem_unit11_electrochemistry',
    subjectId: 'chemistry',
    name: 'Electrochemistry',
    sinhalaName: 'විද්‍යුත් රසායනය',
    unitOrLesson: 'Unit 11: Electrochemistry',
    priority: 'high',
    sections: [
      { id: 'chem_s35', name: "Electrolytic Cells & Faraday's Laws", sinhalaName: 'විද්‍යුත් විච්ඡේදනය' },
      { id: 'chem_s36', name: 'Galvanic Cells & Standard Electrode Potentials', sinhalaName: 'ගැල්වානි කෝෂ' },
      { id: 'chem_s37', name: 'Corrosion & Metal Passivation', sinhalaName: 'ඛාදනය සහ ආරක්ෂණය' },
    ],
  },
  {
    id: 'chem_unit12_industrial_environment',
    subjectId: 'chemistry',
    name: 'Industrial Chemistry & Environmental Pollution',
    sinhalaName: 'කාර්මික රසායනය සහ පාරිසරික දූෂණය',
    unitOrLesson: 'Unit 12: Industrial Chemistry',
    priority: 'medium',
    sections: [
      { id: 'chem_s38', name: 'Haber & Contact Processes; Metal Extraction', sinhalaName: 'කාර්මික නිෂ්පාදන' },
      { id: 'chem_s39', name: 'Soap, Detergents & Polymers', sinhalaName: 'සබන් සහ බහුඅවයවික' },
      { id: 'chem_s40', name: 'Air & Water Pollution, Acid Rain, Ozone Layer', sinhalaName: 'පාරිසරික දූෂණය' },
    ],
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  studentName: 'Minuka Hirushan',
  examDate: '2027-08-01',
  examYear: 2027,
  targetMarks: {
    combined_maths: 75,
    physics: 75,
    chemistry: 75,
  },
  weakTopicThreshold: 50,
  preferredLanguage: 'bilingual',
  showOnlyApprovedMarksInDashboard: true,
  googleDriveConnected: false,
  adminPassword: 'al2027',
  isPasswordRequiredForAdmin: true,
};

export const ADMIN_USER: UserProfile = {
  id: 'user_admin',
  name: 'Nuwan Perera',
  role: 'admin',
  email: 'nuwan.perera@example.com',
  title: 'Older Sibling & Academic Reviewer',
};

export const STUDENT_USER: UserProfile = {
  id: 'user_student',
  name: 'Minuka Hirushan',
  role: 'student',
  email: 'minuka.al@example.com',
  title: 'A/L Physical Science Candidate (2027)',
};

// Storage keys
const STORAGE_PREFIX = 'al_tracker_';
export const KEYS = {
  CURRENT_USER_ROLE: `${STORAGE_PREFIX}user_role`,
  PAPERS: `${STORAGE_PREFIX}papers`,
  SUBMISSIONS: `${STORAGE_PREFIX}submissions`,
  TOPICS: `${STORAGE_PREFIX}topics`,
  HOMEWORK: `${STORAGE_PREFIX}homework`,
  PLANNER: `${STORAGE_PREFIX}planner`,
  GOALS: `${STORAGE_PREFIX}goals`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  NOTIFICATIONS: `${STORAGE_PREFIX}notifications`,
};

export function loadItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed to parse stored item for key ${key}:`, err);
    return defaultValue;
  }
}

export function saveItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to store item for key ${key}:`, err);
  }
}

// Sri Lankan date formatting: DD/MM/YYYY
export function formatSLDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

// Format relative date (e.g., 'Due in 2 days', 'Overdue by 3 days')
export function getRelativeDeadline(deadlineStr: string): { text: string; isOverdue: boolean; daysDiff: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(deadlineStr);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`,
      isOverdue: true,
      daysDiff: diffDays,
    };
  } else if (diffDays === 0) {
    return { text: 'Due Today', isOverdue: false, daysDiff: 0 };
  } else if (diffDays === 1) {
    return { text: 'Due Tomorrow', isOverdue: false, daysDiff: 1 };
  } else {
    return { text: `Due in ${diffDays} days`, isOverdue: false, daysDiff: diffDays };
  }
}

// Calculate days until exam
export function getDaysUntilExam(examDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDateStr);
  exam.setHours(0, 0, 0, 0);
  const diffTime = exam.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

// Check if an item is part of the initial demo/sample dataset
export function isSampleRecord(id: string): boolean {
  return (
    id === 'paper_1' ||
    id === 'paper_2' ||
    id === 'paper_3' ||
    id === 'paper_4' ||
    id === 'paper_5' ||
    id === 'sub_1' ||
    id === 'sub_2' ||
    id === 'hw_1' ||
    id === 'hw_2' ||
    id === 'hw_3' ||
    id === 'hw_4' ||
    id === 'sess_1' ||
    id === 'sess_2' ||
    id === 'sess_3' ||
    id === 'goal_curr'
  );
}

// Generate realistic demo dataset
export function generateDemoData(): {
  papers: PaperRecord[];
  submissions: PaperSubmission[];
  homework: HomeworkTask[];
  sessions: StudySession[];
  goals: WeeklyGoal[];
} {
  const now = new Date();
  const formatOffset = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const papers: PaperRecord[] = [
    {
      id: 'paper_1',
      subjectId: 'combined_maths',
      paperName: 'Term Test 1 - Pure Maths',
      paperNumber: 'CM-2026-01',
      paperDate: formatOffset(28),
      paperType: 'full_paper',
      marksObtained: 68,
      maximumMarks: 100,
      percentage: 68.0,
      durationMinutes: 180,
      attemptNumber: 1,
      topicIds: ['cm_pure_algebra', 'cm_pure_trig'],
      notes: 'Strong in quadratic roots, lost marks in compound angle identities.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVerifiedByReviewer: true,
      verifiedMarks: 68,
    },
    {
      id: 'paper_2',
      subjectId: 'physics',
      paperName: 'Weekly Paper Class 04 - Mechanics',
      paperNumber: 'PHY-W-04',
      paperDate: formatOffset(21),
      paperType: 'structured_essay',
      marksObtained: 38,
      maximumMarks: 50,
      percentage: 76.0,
      durationMinutes: 90,
      attemptNumber: 1,
      topicIds: ['phy_mechanics'],
      notes: 'Good conceptual clarity in rotational dynamics.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVerifiedByReviewer: true,
      verifiedMarks: 38,
    },
    {
      id: 'paper_3',
      subjectId: 'chemistry',
      paperName: 'Unit Test - Chemical Calculations',
      paperNumber: 'CHEM-UT-02',
      paperDate: formatOffset(14),
      paperType: 'class_test',
      marksObtained: 28,
      maximumMarks: 40,
      percentage: 70.0,
      durationMinutes: 60,
      attemptNumber: 1,
      topicIds: ['chem_calculations'],
      notes: 'Mole concept titrations were clear, calculation error in part 3.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVerifiedByReviewer: true,
      verifiedMarks: 28,
    },
    {
      id: 'paper_4',
      subjectId: 'combined_maths',
      paperName: 'Weekly Paper Class 07 - Calculus & Kinematics',
      paperNumber: 'CM-W-07',
      paperDate: formatOffset(7),
      paperType: 'full_paper',
      marksObtained: 74,
      maximumMarks: 100,
      percentage: 74.0,
      durationMinutes: 180,
      attemptNumber: 1,
      topicIds: ['cm_pure_calc', 'cm_app_mechanics_kinematics'],
      notes: 'Marked improvement in limits and velocity-time graph reasoning.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVerifiedByReviewer: true,
      verifiedMarks: 74,
    },
    {
      id: 'paper_5',
      subjectId: 'physics',
      paperName: 'Weekly Paper Class 05 - Oscillations & Waves',
      paperNumber: 'PHY-W-05',
      paperDate: formatOffset(2),
      paperType: 'full_paper',
      marksObtained: 62,
      maximumMarks: 100,
      percentage: 62.0,
      durationMinutes: 180,
      attemptNumber: 1,
      topicIds: ['phy_oscillations_waves'],
      notes: 'Need to review Doppler effect signs carefully.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVerifiedByReviewer: false,
    },
  ];

  const submissions: PaperSubmission[] = [
    {
      id: 'sub_1',
      paperId: 'paper_5',
      subjectId: 'physics',
      paperName: 'Weekly Paper Class 05 - Oscillations & Waves',
      paperDate: formatOffset(2),
      paperType: 'full_paper',
      studentMarksObtained: 62,
      maximumMarks: 100,
      attemptNumber: 1,
      status: 'submitted',
      studentNotes: 'Sir marked 62/100. Please check Question 4 regarding Doppler formula deduction.',
      files: [
        {
          id: 'file_p5_answers',
          name: 'Physics_Paper05_MarkedScript_2026.pdf',
          size: 1420500,
          fileType: 'marked_paper',
          mimeType: 'application/pdf',
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'user_student',
          driveSyncStatus: 'not_connected',
        },
      ],
      comments: [
        {
          id: 'comm_1',
          submissionId: 'sub_1',
          authorId: 'user_student',
          authorName: 'Minuka Hirushan',
          authorRole: 'student',
          content: 'Uploaded marked script from Sunday class. Please review section B.',
          createdAt: new Date().toISOString(),
        },
      ],
      markAudit: [],
      topicIds: ['phy_oscillations_waves'],
      createdAt: formatOffset(2),
      submittedAt: formatOffset(2),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sub_2',
      paperId: 'paper_4',
      subjectId: 'combined_maths',
      paperName: 'Weekly Paper Class 07 - Calculus & Kinematics',
      paperDate: formatOffset(7),
      paperType: 'full_paper',
      studentMarksObtained: 72,
      maximumMarks: 100,
      reviewerVerifiedMarks: 74,
      attemptNumber: 1,
      status: 'approved',
      studentNotes: 'Paper 7 completed in 2h 45m.',
      reviewerNotes: 'Verified! Question 7b was marked too strictly by the class tutor; adjusted to 74%.',
      files: [
        {
          id: 'file_cm7_script',
          name: 'CombinedMaths_Paper07_Minuka.pdf',
          size: 2180000,
          fileType: 'marked_paper',
          mimeType: 'application/pdf',
          uploadedAt: formatOffset(6),
          uploadedBy: 'user_student',
          driveSyncStatus: 'not_connected',
        },
      ],
      comments: [
        {
          id: 'comm_2',
          submissionId: 'sub_2',
          authorId: 'user_admin',
          authorName: 'Nuwan Perera',
          authorRole: 'admin',
          content: 'Excellent integration method used in Question 6. Approved with +2 adjustment.',
          pageNumber: 3,
          createdAt: formatOffset(6),
        },
      ],
      markAudit: [
        {
          id: 'aud_1',
          submissionId: 'sub_2',
          paperId: 'paper_4',
          previousMarks: 72,
          newMarks: 74,
          changedBy: 'user_admin',
          changedByName: 'Nuwan Perera',
          changedByRole: 'admin',
          reason: 'Corrected step-mark credit in Question 7b integral',
          timestamp: formatOffset(6),
        },
      ],
      topicIds: ['cm_pure_calc', 'cm_app_mechanics_kinematics'],
      createdAt: formatOffset(7),
      submittedAt: formatOffset(7),
      reviewedAt: formatOffset(6),
      approvedAt: formatOffset(6),
      updatedAt: formatOffset(6),
    },
  ];

  const homework: HomeworkTask[] = [
    {
      id: 'hw_1',
      subjectId: 'combined_maths',
      topicId: 'cm_pure_calc',
      sectionId: 's10',
      teacherOrClass: 'Ruwan Darshana Sir (Rotary Hall)',
      assignedDate: formatOffset(10),
      deadline: formatOffset(3),
      title: 'Calculus Tutorial 04 - Maxima & Minima Applications',
      description: 'Questions 15 to 30 on real-world geometry optimization problems.',
      homeworkType: 'tutorial',
      estimatedMinutes: 120,
      questionsAssigned: 15,
      questionsAttempted: 15,
      questionsCompleted: 15,
      status: 'completed',
      completedDate: formatOffset(4),
      assessedMarks: 27,
      assessedMaxMarks: 30,
      accuracyPercentage: 90,
      notes: 'Completed with full working. Cylinder problem in Q24 was tricky.',
      createdAt: formatOffset(10),
      updatedAt: formatOffset(4),
    },
    {
      id: 'hw_2',
      subjectId: 'physics',
      topicId: 'phy_oscillations_waves',
      sectionId: 'p8',
      teacherOrClass: 'Amitha Indrajith Sir',
      assignedDate: formatOffset(5),
      deadline: formatOffset(-1), // Tomorrow
      title: 'Doppler Effect Past Paper Questions (2015-2023)',
      description: 'Structured essay questions on moving source and reflected sound.',
      homeworkType: 'past_paper',
      estimatedMinutes: 90,
      questionsAssigned: 12,
      questionsAttempted: 8,
      questionsCompleted: 8,
      status: 'in_progress',
      notes: 'Q9 on radar wave reflection needs clarification.',
      difficultiesFaced: 'Sign convention when both observer and source are moving at angles.',
      questionsForTeacher: 'How to handle Doppler shift when wind speed is non-zero?',
      createdAt: formatOffset(5),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'hw_3',
      subjectId: 'chemistry',
      topicId: 'chem_organic',
      sectionId: 'c15',
      teacherOrClass: 'K. Siriwardana Sir',
      assignedDate: formatOffset(8),
      deadline: formatOffset(1), // Yesterday (Overdue!)
      title: 'Nucleophilic Substitution SN1 vs SN2 Question Bank',
      description: 'Identify mechanisms for 20 haloalkane hydrolysis conversions.',
      homeworkType: 'tutorial',
      estimatedMinutes: 75,
      questionsAssigned: 20,
      questionsAttempted: 5,
      questionsCompleted: 5,
      status: 'in_progress',
      notes: 'Overdue! Needs urgent completion before Friday class.',
      difficultiesFaced: 'Stereochemistry inversion in optically active halides.',
      createdAt: formatOffset(8),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'hw_4',
      subjectId: 'combined_maths',
      topicId: 'cm_app_mechanics_newton',
      sectionId: 's18',
      teacherOrClass: 'Ruwan Darshana Sir',
      assignedDate: formatOffset(2),
      deadline: formatOffset(-4), // In 4 days
      title: 'Friction on Inclined Planes Revision Set',
      description: 'Limiting friction problems with connected particles on rough wedges.',
      homeworkType: 'revision',
      estimatedMinutes: 60,
      questionsAssigned: 10,
      questionsAttempted: 0,
      questionsCompleted: 0,
      status: 'not_started',
      createdAt: formatOffset(2),
      updatedAt: formatOffset(2),
    },
  ];

  const sessions: StudySession[] = [
    {
      id: 'sess_1',
      subjectId: 'combined_maths',
      date: formatOffset(2),
      startTime: '16:00',
      plannedMinutes: 120,
      actualMinutes: 130,
      topicId: 'cm_pure_calc',
      objective: 'Practice 10 integration by parts questions from 2018-2022 papers.',
      status: 'completed',
      notes: 'Smooth session, finished ahead of schedule.',
      createdAt: formatOffset(2),
    },
    {
      id: 'sess_2',
      subjectId: 'physics',
      date: formatOffset(1),
      startTime: '19:30',
      plannedMinutes: 90,
      actualMinutes: 75,
      topicId: 'phy_oscillations_waves',
      objective: 'Doppler effect formula deduction and 5 past paper structured questions.',
      status: 'partially_completed',
      notes: 'Felt tired, postponed Q4 and Q5.',
      createdAt: formatOffset(1),
    },
    {
      id: 'sess_3',
      subjectId: 'chemistry',
      date: formatOffset(0),
      startTime: '16:30',
      plannedMinutes: 100,
      topicId: 'chem_organic',
      objective: 'Complete overdue SN1/SN2 tutorial questions.',
      status: 'scheduled',
      createdAt: formatOffset(0),
    },
  ];

  const goals: WeeklyGoal[] = [
    {
      id: 'goal_curr',
      weekStartDate: formatOffset(now.getDay() === 0 ? 6 : now.getDay() - 1),
      targetStudyHours: 25,
      targetPapers: 3,
      targetHomeworkCompleted: 4,
      achievements: 'Kept consistent morning revision for Combined Maths.',
      difficulties: 'Organic reaction conditions need flashcard review.',
      nextWeekPriorities: 'Complete Chemistry unit test paper revision and Physics past papers.',
    },
  ];

  return { papers, submissions, homework, sessions, goals };
}
