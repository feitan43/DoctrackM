import {Dimensions} from 'react-native';

export const formatFileSize = size => {
  if (!size) return '0 KB';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
  return (size / (1024 * 1024)).toFixed(2) + ' MB';
};

export const getQuarter = month => {
  if (month >= 1 && month <= 3) return '1st Quarter';
  if (month >= 4 && month <= 6) return '2nd Quarter';
  if (month >= 7 && month <= 9) return '3rd Quarter';
  if (month >= 10 && month <= 12) return '4th Quarter';
  return null;
};

export const years = Array.from(
  {length: Math.max(0, new Date().getFullYear() - 2023 + 1)},
  (_, index) => new Date().getFullYear() - index,
);

export const currentYear = new Date().getFullYear();

export const {width, height} = Dimensions.get('window');

export const removeHtmlTags = text => {
  if (!text) return '';
  const boldEndRegex = /<\/b>/g;
  const newText = text.replace(boldEndRegex, '</b>\n');
  const htmlRegex = /<[^>]*>/g;
  return newText.replace(htmlRegex, ' ');
};

export const formatDateTime = text => {
  const date = new Date(text);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 -> 12

  const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  return `${year}-${month}-${day} ${formattedTime}`;
};

export const categoryIconMap = {
  'Audio-Video Equipment - A': 'monitor-speaker',
  'Audio-Video Equipment - B': 'camcorder',
  'Audio-Video Equipment - C': 'headphones',
  'Audio-Video Spare Parts and Accessories': 'speaker-wireless',
  'Audio-Video Supplies and Materials': 'speaker',
  'Auto Repair Shop': 'car-wrench',
  'Art and Sign Services': 'palette',
  'Breeding Animals': 'paw',
  'Clothing (for Emergency Situations)': 'tshirt-crew',
  'Computer Equipment and Accessories': 'monitor',
  'Computer Repair Services': 'desktop-classic',
  'Computer Software': 'code-tags',
  'Computer Supplies and Materials': 'harddisk',
  'Construction Supplies and Materials': 'hammer-wrench',
  'Construction Tools and Equipment': 'toolbox',
  'Dental Supplies and Materials': 'tooth-outline',
  'Drugs and Medicines': 'pill',
  'Electrical Equipment and Appliances - A': 'blender',
  'Electrical Equipment and Appliances - B': 'microwave',
  'Electrical Equipment and Appliances - Repairs': 'current-ac',
  'Electrical Supplies and Materials': 'power-plug',
  'Electrical Tools': 'screwdriver',
  'Engineering Supplies, Tools & Equipment': 'compass-outline',
  'Engineering Contractor': 'hard-hat',
  'Food and Catering Services': 'silverware-fork',
  'Fertilizers, Fungicide and Insecticide': 'leaf',
  'Furniture and Fixtures (Ergonomic and Eurotech Type)': 'chair-rolling',
  'Furniture and Fixtures (Non-Ergonomic) ': 'sofa-single',
  'Furniture and Fixtures (Non-Ergonomic)': 'sofa-single',
  'Furniture and Fixtures (Plastic)': 'chair-rolling',
  'Furniture and Fixtures (Plastic) ': 'chair-rolling',
  'Heavy Equipment': 'excavator',
  'Industrial Chemicals': 'beaker-outline',
  'Janitorial Supplies and Materials': 'broom',
  'Gardening Supplies and Materials': 'flower',
  'Gardening Tools and Equipment': 'shovel',
  'Groceries': 'cart',
  'IT Provider': 'desktop-mac-dashboard',
  'Lumber and Plywood': 'saw-blade',
  'Medical Equipment': 'hospital-box-outline',
  'Medical Supplies and Materials': 'bandage',
  'Musical Instruments': 'guitar-acoustic',
  'Office Equipment - Electronic': 'printer',
  'Office Equipment - Manual - A': 'calculator-variant',
  'Office Equipment - Manual - B': 'typewriter',
  'Office Supplies and Materials': 'clipboard-outline',
  'Oil and Lubricants': 'oil',
  'Painting Tools and Materials': 'brush',
  'Plumbing Supplies and Materials': 'pipe-wrench',
  'Plumbing Tools and Equipment': 'pump',
  'Printed Forms and Printing Services': 'file-document-outline',
  'Publication': 'book-open-variant',
  'Quarry Materials': 'rock',
  'Radio Communications Equipment': 'radio',
  'Road Construction Materials': 'road',
  'Security Services': 'security',
  'Seed and Seedlings': 'seed-outline',
  'Spare Parts for Light & Heavy Equipment': 'engine-outline',
  'Sports Attire - A': 'shoe-sneaker',
  'Sports Attire - B': 'basketball',
  'Sports Equipment and Supplies': 'dumbbell',
  'Sub-Category Medals & Trophies': 'medal',
  'Tire, Batteries, and Accessories - 4 Wheels': 'tire',
  'Tire, Batteries, and Accessories - 2 Wheels': 'motorbike',
  'Vehicles (2 Wheels) and Accessories': 'bike',
  'Vehicles (4 Wheels) and Accessories': 'car-sports',
  'Veterinary Drugs and Medicines': 'medical-bag',
  'Veterinary Supplies and Materials': 'stethoscope',
  'BEDDING SUPPLIES': 'bed-outline',
  'Surgical Supplies': 'knife',
  'Laboratory Supplies': 'flask-outline',
  'Laboratory Reagents and Chemicals': 'test-tube',
  'Computer Peripherals and Accessories': 'mouse',
  'Glasswares': 'bottle-wine-outline',
  'Subscription': 'cash-multiple',
  'FUEL, OIL, LUBRICANTS AND SERVICING': 'fuel',
  'Electronic Consumables': 'chip',
  'TAILORING': 'hanger',
  'Postage and Stamps': 'post-outline',
  'Fire and Rescue Equipment': 'fire-truck',
  'Fire and Rescue Equipment ': 'fire-truck',
  'Accountable Forms': 'file-document-edit-outline',
  'Fabrication': 'tools',
  'No Category': 'help-circle-outline',
  'OXYGEN AND ACETYLENE': 'cylinder',
  'OFFICE EQUIPMENT - SPARE PARTS/REPAIR': 'cog-outline',
  'Security and Safety Supplies and materials': 'shield-check-outline',
  'EQUIPMENT RENTAL': 'toolbox',
  'EQUIPMENT RENTAL ': 'toolbox',
  'GUNS AND AMMUNITIONS': 'gun',
  'SECURITY & SAFETY DEVICES, TOOLS AND EQUIPMENT': 'alarm-light-outline',
  'Cabinet Eurotec Type': 'cabinet-outline',
  'GOLDSMITH AND METAL CRAFT SERVICES': 'gold',
  'Textile Supplies and Materials': 'scissors-cutting',
  'AGRICULTURAL CHEMICAL': 'chemical-weapon',
  'AGRICULTURAL SUPPPLIES AND EQUIPMENT': 'tractor-variant',
  'BUSINESS AND BICYCLE PLATES': 'bike-fast',
  'CAMPING MATERIALS AND EQUIPMENT': 'tent',
  'CELLULAR PHONES AND ACCESSORIES': 'cellphone',
  'CONSTRUCTION REPAIR': 'repair',
  'Training Supplies and Materials (Cosmetology Equipment)': 'face-woman',
  'Training Supplies and Materials': 'book-open-variant',
  'EYE GLASSES': 'glasses',
  'FIRE AND RESCUE SUPPLIES AND MATERIALS': 'fire-extinguisher',
  'HAULING SERVICES': 'truck-trailer',
  'MECHANICAL EQUIPMENT': 'engine',
  'UMBRELLAS': 'umbrella',
  'UMBRELLA': 'umbrella',
  'Quarry Materials': 'dump-truck',
  'SERVICES': 'handshake-outline',
  'MECHANICAL TOOLS, INSTRUMENTS, MATERIALS': 'wrench',
  'MECHANICAL TOOLS AND MATERIALS': 'wrench-outline',
  'Books and References': 'book-multiple-outline',
  'Kitchenwares': 'silverware-fork-knife',
  'Diving Equipment and Accessories': 'diving-scuba',
  'Measurement & Analysis Instruments': 'gauge',
  'Fruits and Vegetables': 'food-apple-outline',
  'Non-PR Transactions': 'cash-remove',
  'Infrastructures/Civil Works': 'office-building',
  'Rescue and Safety Tools/Devices': 'lifebuoy',
  'Tokens, Souvenirs, and Kit': 'trophy-variant-outline',
  // Add more mappings as needed
};

export const getIcon = (description = '') => {
  const desc = description.toLowerCase();

  // If the description is empty, return a default icon immediately
  if (!desc) {
    return 'apps-outline';
  }

  // Use a Map to store categories and their keywords for easier management
  const categories = new Map([
    // Home & Office
    [['furniture', 'cabinet'], 'home-outline'],
    [['janitorial', 'cleaning'], 'brush-outline'],
    [['computer', 'it', 'software', 'peripherals'], 'laptop-outline'],
    [['office', 'forms', 'postage', 'subscription'], 'briefcase-outline'],

    // General Supplies & Equipment
    [['supplies', 'materials', 'consumables'], 'cube-outline'],
    [['equipment', 'tools', 'devices', 'mechanical'], 'build-outline'],
    [['appliances', 'electronic', 'electrical'], 'bulb-outline'],

    // Food & Dining
    [['groceries', 'food', 'fruits', 'vegetables'], 'basket-outline'],
    [['kitchen', 'glasswares', 'bedding', 'umbrella'], 'restaurant-outline'],

    // Media & Recreation
    [['audio-video', 'radio', 'musical'], 'tv-outline'],
    [['sports', 'camping', 'diving'], 'walk-outline'],
    [['books', 'references'], 'book-outline'],

    // Clothing & Medical
    [['tailoring', 'clothing', 'textile', 'attire'], 'cut-outline'],
    [['medical', 'surgical', 'veterinary', 'dental'], 'medkit-outline'],
    [['drugs', 'medicines', 'reagents'], 'flask-outline'],
    [['laboratory', 'analysis', 'measurement'], 'eyedrop-outline'],

    // Safety & Vehicles
    [['security', 'fire', 'rescue', 'safety', 'guns'], 'shield-outline'],
    [['vehicles', 'tires', 'auto', 'bicycle'], 'car-outline'],

    // Construction & Maintenance
    [['construction', 'civil works', 'repair'], 'construct-outline'],
    [['gardening', 'fertilizers', 'seed'], 'leaf-outline'],

    // Business & Services
    [['accountable', 'business', 'publication'], 'document-text-outline'],
    [
      [
        'training',
        'services',
        'provider',
        'servicing',
        'engineering',
        'fabrication',
        'goldsmith',
      ],
      'people-outline',
    ],

    // Chemicals & Fuels
    [['fuel', 'oil', 'lubricants', 'oxygen', 'chemicals'], 'flame-outline'],

    // Miscellaneous
    [['token', 'souvenir', 'medals', 'trophies', 'kit'], 'gift-outline'],
    [
      ['no category', 'non-pr', 'others', 'miscellaneous'],
      'help-circle-outline',
    ],
  ]);

  // Iterate through the categories and check for keyword matches
  for (const [keywords, icon] of categories) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return icon;
    }
  }

  // Default icon if no match found
  return 'apps-outline';
};

export const categories = [
  // ADDED export here
  {
    name: 'Computer Equipment',
    icon: 'laptop',
    cat: ['CAT 10', 'CAT 10.1', 'CAT 11', 'CAT 12', 'CAT 13', 'CAT 36'],
  },
  {
    name: 'Office Equipment',
    icon: 'printer',
    cat: ['CAT 41', 'CAT 41.1', 'CAT 42', 'CAT 43', 'CAT 86'],
  },
  {
    name: 'Audio-Video Equipment',
    icon: 'television',
    cat: ['CAT 1', 'CAT 2', 'CAT 3', 'CAT 4', 'CAT 5'],
  },
  {
    name: 'Furniture & Fixtures',
    icon: 'sofa',
    cat: ['CAT 27', 'CAT 27.1', 'CAT 28', 'CAT 29'],
  },
  {name: 'IT Services', icon: 'server', cat: ['CAT 36']},
  {name: 'Food & Catering', icon: 'silverware-fork-knife', cat: ['CAT 25']},
  {name: 'Groceries', icon: 'cart', cat: ['CAT 35', 'CAT 35.1', 'CAT 98']},
  {
    name: 'Medical Supplies',
    icon: 'hospital-box',
    cat: [
      'CAT 16',
      'CAT 17',
      'CAT 38',
      'CAT 39',
      'CAT 39.1',
      'CAT 39.2',
      'CAT 39.3',
    ],
  },
  {
    name: 'Electrical Equipment',
    icon: 'lightbulb-outline',
    cat: ['CAT 18', 'CAT 19', 'CAT 20', 'CAT 21', 'CAT 22'],
  },
  {name: 'Plumbing Supplies', icon: 'pipe', cat: ['CAT 47', 'CAT 48']},
  {
    name: 'Sports Equipment',
    icon: 'basketball',
    cat: ['CAT 57', 'CAT 58', 'CAT 59', 'CAT 59.1'],
  },
  {
    name: 'Vehicles & Accessories',
    icon: 'car',
    cat: ['CAT 60', 'CAT 61', 'CAT 62', 'CAT 63'],
  },
  {
    name: 'Security & Safety',
    icon: 'shield-lock-outline',
    cat: ['CAT 54', 'CAT 78', 'CAT 88', 'CAT 89', 'CAT 101'],
  },
  {
    name: 'Construction Materials',
    icon: 'tools',
    cat: [
      'CAT 14',
      'CAT 14.1',
      'CAT 15',
      'CAT 24',
      'CAT 30',
      'CAT 53',
      'CAT 73',
      'CAT 100',
    ],
  },
  {name: 'Tailoring', icon: 'needle', cat: ['CAT 90']},
  {
    name: 'Subscription Services',
    icon: 'credit-card-outline',
    cat: ['CAT 69'],
  },
  {
    name: 'Others',
    icon: 'dots-horizontal',
    cat: [
      'CAT 6',
      'CAT 7',
      'CAT 8',
      'CAT 9',
      'CAT 9.1',
      'CAT 26',
      'CAT 31',
      'CAT 32',
      'CAT 33',
      'CAT 34',
      'CAT 37',
      'CAT 40',
      'CAT 44',
      'CAT 45',
      'CAT 46',
      'CAT 49',
      'CAT 50',
      'CAT 51',
      'CAT 52',
      'CAT 55',
      'CAT 56',
      'CAT 64',
      'CAT 65',
      'CAT 66',
      'CAT 67',
      'CAT 68',
      'CAT 70',
      'CAT 71',
      'CAT 72',
      'CAT 74',
      'CAT 75',
      'CAT 76',
      'CAT 77',
      'CAT 79',
      'CAT 80',
      'CAT 81',
      'CAT 82',
      'CAT 83',
      'CAT 84',
      'CAT 85',
      'CAT 87',
      'CAT 91',
      'CAT 92',
      'CAT 93',
      'CAT 94',
      'CAT 95',
      'CAT 96',
      'CAT 97',
      'CAT 99',
      'CAT 102',
      'NO CAT',
      '',
      null,
    ],
  },
];

/**
 * Finds the category object that contains the given 'cat' code.
 * @param {string | null} catCode The 'cat' code to search for (e.g., 'CAT 10', 'NO CAT', '').
 * @returns {object | null} The category object if found, otherwise null.
 */
export function getCategoryByCatCode(catCode) {
  for (const category of categories) {
    if (category.cat.includes(catCode)) {
      return category;
    }
  }
  return null; // Return null if no matching category is found
}
