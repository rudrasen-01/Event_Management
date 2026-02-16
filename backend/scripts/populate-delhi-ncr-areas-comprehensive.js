const mongoose = require('mongoose');
const path = require('path');
const City = require('../models/City');
const Area = require('../models/Area');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ============================================================================
// DELHI NCR COMPREHENSIVE AREA LIST WITH ACCURATE COORDINATES
// ============================================================================

const DELHI_NCR_AREAS = {
  'Delhi': [
    // Central Delhi
    { name: 'Connaught Place', lat: 28.6315, lon: 77.2167, type: 'locality' },
    { name: 'Janpath', lat: 28.6213, lon: 77.2208, type: 'locality' },
    { name: 'Mandi House', lat: 28.6254, lon: 77.2345, type: 'locality' },
    { name: 'ITO', lat: 28.6281, lon: 77.2460, type: 'locality' },
    { name: 'Daryaganj', lat: 28.6504, lon: 77.2398, type: 'locality' },
    { name: 'Chandni Chowk', lat: 28.6506, lon: 77.2303, type: 'locality' },
    { name: 'Jama Masjid', lat: 28.6507, lon: 77.2334, type: 'locality' },
    { name: 'Paharganj', lat: 28.6441, lon: 77.2151, type: 'locality' },
    { name: 'Karol Bagh', lat: 28.6519, lon: 77.1920, type: 'suburb' },
    { name: 'Rajinder Nagar', lat: 28.6435, lon: 77.1874, type: 'suburb' },
    { name: 'Patel Nagar', lat: 28.6544, lon: 77.1705, type: 'suburb' },
    { name: 'Turkman Gate', lat: 28.6446, lon: 77.2241, type: 'locality' },

    // North Delhi
    { name: 'Civil Lines', lat: 28.6800, lon: 77.2280, type: 'suburb' },
    { name: 'Model Town', lat: 28.7196, lon: 77.1935, type: 'suburb' },
    { name: 'Kamla Nagar', lat: 28.6817, lon: 77.2056, type: 'suburb' },
    { name: 'Mukherjee Nagar', lat: 28.7044, lon: 77.2096, type: 'suburb' },
    { name: 'Timarpur', lat: 28.7150, lon: 77.2204, type: 'suburb' },
    { name: 'Burari', lat: 28.7549, lon: 77.1985, type: 'suburb' },
    { name: 'Sant Nagar', lat: 28.6950, lon: 77.2150, type: 'suburb' },
    { name: 'Shakti Nagar', lat: 28.6978, lon: 77.1899, type: 'suburb' },
    { name: 'Kingsway Camp', lat: 28.6945, lon: 77.2189, type: 'suburb' },
    { name: 'GTB Nagar', lat: 28.6972, lon: 77.2094, type: 'suburb' },

    // North East Delhi
    { name: 'Seelampur', lat: 28.6680, lon: 77.2770, type: 'suburb' },
    { name: 'Welcome', lat: 28.7095, lon: 77.2771, type: 'suburb' },
    { name: 'Jafrabad', lat: 28.6726, lon: 77.2774, type: 'suburb' },
    { name: 'Gokulpuri', lat: 28.7079, lon: 77.2864, type: 'suburb' },
    { name: 'Nand Nagri', lat: 28.6711, lon: 77.2958, type: 'suburb' },
    { name: 'Bhajanpura', lat: 28.6976, lon: 77.2791, type: 'suburb' },
    { name: 'Khajuri Khas', lat: 28.6537, lon: 77.2976, type: 'suburb' },
    { name: 'Karawal Nagar', lat: 28.7250, lon: 77.2830, type: 'suburb' },
    { name: 'Dilshad Garden', lat: 28.6862, lon: 77.3239, type: 'suburb' },

    // North West Delhi
    { name: 'Rohini Sector 1', lat: 28.7388, lon: 77.1206, type: 'locality' },
    { name: 'Rohini Sector 3', lat: 28.7152, lon: 77.1140, type: 'locality' },
    { name: 'Rohini Sector 7', lat: 28.7367, lon: 77.1165, type: 'locality' },
    { name: 'Rohini Sector 8', lat: 28.7016, lon: 77.1063, type: 'locality' },
    { name: 'Rohini Sector 9', lat: 28.7318, lon: 77.1256, type: 'locality' },
    { name: 'Rohini Sector 10', lat: 28.7281, lon: 77.1129, type: 'locality' },
    { name: 'Rohini Sector 11', lat: 28.7447, lon: 77.1178, type: 'locality' },
    { name: 'Rohini Sector 13', lat: 28.7486, lon: 77.0897, type: 'locality' },
    { name: 'Rohini Sector 15', lat: 28.7265, lon: 77.0972, type: 'locality' },
    { name: 'Rohini Sector 16', lat: 28.7437, lon: 77.0967, type: 'locality' },
    { name: 'Rohini Sector 18', lat: 28.7502, lon: 77.0763, type: 'locality' },
    { name: 'Rohini Sector 22', lat: 28.7379, lon: 77.0804, type: 'locality' },
    { name: 'Rohini Sector 24', lat: 28.7278, lon: 77.0805, type: 'locality' },
    { name: 'Pitampura', lat: 28.6981, lon: 77.1318, type: 'suburb' },
    { name: 'Shalimar Bagh', lat: 28.7199, lon: 77.1641, type: 'suburb' },
    { name: 'Ashok Vihar', lat: 28.6951, lon: 77.1762, type: 'suburb' },
    { name: 'Keshav Puram', lat: 28.6717, lon: 77.1639, type: 'suburb' },
    { name: 'Wazirpur', lat: 28.6958, lon: 77.1645, type: 'suburb' },
    { name: 'Adarsh Nagar', lat: 28.7131, lon: 77.1698, type: 'suburb' },
    { name: 'Jahangirpuri', lat: 28.7292, lon: 77.1658, type: 'suburb' },
    { name: 'Bawana', lat: 28.7959, lon: 77.0373, type: 'suburb' },
    { name: 'Narela', lat: 28.8522, lon: 77.0942, type: 'suburb' },

    // West Delhi
    { name: 'Janakpuri', lat: 28.6217, lon: 77.0841, type: 'suburb' },
    { name: 'Uttam Nagar', lat: 28.6220, lon: 77.0590, type: 'suburb' },
    { name: 'Tilak Nagar', lat: 28.6407, lon: 77.0958, type: 'suburb' },
    { name: 'Rajouri Garden', lat: 28.6414, lon: 77.1218, type: 'suburb' },
    { name: 'Punjabi Bagh', lat: 28.6693, lon: 77.1314, type: 'suburb' },
    { name: 'Paschim Vihar', lat: 28.6708, lon: 77.1025, type: 'suburb' },
    { name: 'Moti Nagar', lat: 28.6605, lon: 77.1456, type: 'suburb' },
    { name: 'Kirti Nagar', lat: 28.6530, lon: 77.1420, type: 'suburb' },
    { name: 'Hari Nagar', lat: 28.6226, lon: 77.1116, type: 'suburb' },
    { name: 'Vikaspuri', lat: 28.6418, lon: 77.0639, type: 'suburb' },

    // South Delhi
    { name: 'Saket', lat: 28.5244, lon: 77.2066, type: 'suburb' },
    { name: 'Malviya Nagar', lat: 28.5283, lon: 77.2076, type: 'suburb' },
    { name: 'Hauz Khas', lat: 28.5494, lon: 77.2001, type: 'suburb' },
    { name: 'Green Park', lat: 28.5595, lon: 77.2069, type: 'suburb' },
    { name: 'Greater Kailash I', lat: 28.5488, lon: 77.2401, type: 'suburb' },
    { name: 'Greater Kailash II', lat: 28.5328, lon: 77.2467, type: 'suburb' },
    { name: 'Defence Colony', lat: 28.5745, lon: 77.2339, type: 'suburb' },
    { name: 'Lajpat Nagar I', lat: 28.5677, lon: 77.2432, type: 'suburb' },
    { name: 'Lajpat Nagar II', lat: 28.5657, lon: 77.2438, type: 'suburb' },
    { name: 'Lajpat Nagar III', lat: 28.5638, lon: 77.2498, type: 'suburb' },
    { name: 'Lajpat Nagar IV', lat: 28.5726, lon: 77.2500, type: 'suburb' },
    { name: 'Kalkaji', lat: 28.5478, lon: 77.2588, type: 'suburb' },
    { name: 'Nehru Place', lat: 28.5494, lon: 77.2501, type: 'locality' },
    { name: 'Okhla Phase I', lat: 28.5371, lon: 77.2742, type: 'locality' },
    { name: 'Okhla Phase II', lat: 28.5306, lon: 77.2733, type: 'locality' },
    { name: 'Okhla Phase III', lat: 28.5241, lon: 77.2885, type: 'locality' },
    { name: 'Chhatarpur', lat: 28.5064, lon: 77.1750, type: 'suburb' },
    { name: 'Mehrauli', lat: 28.5244, lon: 77.1855, type: 'suburb' },

    // South East Delhi
    { name: 'Jamia Nagar', lat: 28.5585, lon: 77.2817, type: 'suburb' },
    { name: 'Okhla', lat: 28.5494, lon: 77.2750, type: 'suburb' },
    { name: 'Jasola', lat: 28.5458, lon: 77.2910, type: 'suburb' },
    { name: 'Sarita Vihar', lat: 28.5295, lon: 77.2915, type: 'suburb' },
    { name: 'New Friends Colony', lat: 28.5650, lon: 77.2738, type: 'suburb' },
    { name: 'Govindpuri', lat: 28.5363, lon: 77.2730, type: 'suburb' },
    { name: 'Jaitpur', lat: 28.5411, lon: 77.2980, type: 'suburb' },
    { name: 'Badarpur', lat: 28.4950, lon: 77.3089, type: 'suburb' },
    { name: 'Tughlakabad', lat: 28.5081, lon: 77.2825, type: 'suburb' },

    // East Delhi
    { name: 'Laxmi Nagar', lat: 28.6345, lon: 77.2772, type: 'suburb' },
    { name: 'Preet Vihar', lat: 28.6477, lon: 77.2974, type: 'suburb' },
    { name: 'Patparganj', lat: 28.6239, lon: 77.2904, type: 'suburb' },
    { name: 'Mayur Vihar Phase I', lat: 28.6089, lon: 77.3008, type: 'suburb' },
    { name: 'Mayur Vihar Phase II', lat: 28.6124, lon: 77.2939, type: 'suburb' },
    { name: 'Mayur Vihar Phase III', lat: 28.6092, lon: 77.3177, type: 'suburb' },
    { name: 'Vasundhara Enclave', lat: 28.6617, lon: 77.3083, type: 'suburb' },
    { name: 'Krishna Nagar', lat: 28.6707, lon: 77.2824, type: 'suburb' },
    { name: 'Gandhi Nagar', lat: 28.6582, lon: 77.2610, type: 'suburb' },
    { name: 'Geeta Colony', lat: 28.6508, lon: 77.2780, type: 'suburb' },
    { name: 'Shakarpur', lat: 28.6369, lon: 77.2975, type: 'suburb' },

    // South West Delhi
    { name: 'Dwarka Sector 1', lat: 28.5899, lon: 77.0541, type: 'locality' },
    { name: 'Dwarka Sector 2', lat: 28.5895, lon: 77.0605, type: 'locality' },
    { name: 'Dwarka Sector 3', lat: 28.5839, lon: 77.0541, type: 'locality' },
    { name: 'Dwarka Sector 4', lat: 28.5847, lon: 77.0599, type: 'locality' },
    { name: 'Dwarka Sector 5', lat: 28.5791, lon: 77.0546, type: 'locality' },
    { name: 'Dwarka Sector 6', lat: 28.5963, lon: 77.0566, type: 'locality' },
    { name: 'Dwarka Sector 7', lat: 28.5725, lon: 77.0608, type: 'locality' },
    { name: 'Dwarka Sector 8', lat: 28.5653, lon: 77.0703, type: 'locality' },
    { name: 'Dwarka Sector 9', lat: 28.5815, lon: 77.0669, type: 'locality' },
    { name: 'Dwarka Sector 10', lat: 28.5889, lon: 77.0679, type: 'locality' },
    { name: 'Dwarka Sector 11', lat: 28.5847, lon: 77.0732, type: 'locality' },
    { name: 'Dwarka Sector 12', lat: 28.5901, lon: 77.0754, type: 'locality' },
    { name: 'Dwarka Sector 13', lat: 28.5776, lon: 77.0760, type: 'locality' },
    { name: 'Dwarka Sector 14', lat: 28.5740, lon: 77.0777, type: 'locality' },
    { name: 'Dwarka Sector 19', lat: 28.5577, lon: 77.0504, type: 'locality' },
    { name: 'Dwarka Sector 21', lat: 28.5596, lon: 77.0643, type: 'locality' },
    { name: 'Dwarka Sector 22', lat: 28.5582, lon: 77.0591, type: 'locality' },
    { name: 'Dwarka Sector 23', lat: 28.5672, lon: 77.0583, type: 'locality' },
    { name: 'Palam', lat: 28.5504, lon: 77.0745, type: 'suburb' },
    { name: 'Dabri', lat: 28.5996, lon: 77.0489, type: 'suburb' },
    { name: 'Najafgarh', lat: 28.6092, lon: 76.9798, type: 'suburb' },
    { name: 'Kapashera', lat: 28.5353, lon: 77.0770, type: 'suburb' },
    { name: 'Vasant Vihar', lat: 28.5673, lon: 77.1588, type: 'suburb' },
    { name: 'Vasant Kunj', lat: 28.5204, lon: 77.1577, type: 'suburb' },
    { name: 'Mahipalpur', lat: 28.5450, lon: 77.1140, type: 'suburb' },
    { name: 'Chhawla', lat: 28.5750, lon: 76.9895, type: 'suburb' },
    { name: 'Bijwasan', lat: 28.6098, lon: 77.0316, type: 'suburb' },

    // Shahdara
    { name: 'Shahdara', lat: 28.6762, lon: 77.2872, type: 'suburb' },
    { name: 'Vivek Vihar', lat: 28.6721, lon: 77.3160, type: 'suburb' },
    { name: 'Jhilmil Colony', lat: 28.6680, lon: 77.3050, type: 'suburb' },
    { name: 'Seemapuri', lat: 28.6970, lon: 77.2875, type: 'suburb' },
    { name: 'Welcome Colony', lat: 28.7095, lon: 77.2771, type: 'suburb' },
    { name: 'Mansarovar Park', lat: 28.6950, lon: 77.2950, type: 'suburb' }
  ],

  'New Delhi': [
    { name: 'Chanakyapuri', lat: 28.5966, lon: 77.1860, type: 'suburb' },
    { name: 'Lutyens Delhi', lat: 28.6139, lon: 77.2090, type: 'locality' },
    { name: 'Parliament Street', lat: 28.6259, lon: 77.2076, type: 'locality' },
    { name: 'India Gate', lat: 28.6129, lon: 77.2295, type: 'locality' },
    { name: 'Lodhi Road', lat: 28.5935, lon: 77.2260, type: 'locality' },
    { name: 'Golf Links', lat: 28.6190, lon: 77.2345, type: 'suburb' },
    { name: 'Jor Bagh', lat: 28.5791, lon: 77.2165, type: 'locality' },
    { name: 'RK Puram', lat: 28.5640, lon: 77.1820, type: 'suburb' },
    { name: 'Safdarjung', lat: 28.5683, lon: 77.2040, type: 'suburb' },
    { name: 'South Extension I', lat: 28.5700, lon: 77.2235, type: 'suburb' },
    { name: 'South Extension II', lat: 28.5695, lon: 77.2348, type: 'suburb' },
    { name: 'Diplomatic Enclave', lat: 28.5880, lon: 77.1920, type: 'locality' }
  ],

  'Noida': [
    { name: 'Sector 1', lat: 28.5968, lon: 77.3173, type: 'locality' },
    { name: 'Sector 15', lat: 28.5832, lon: 77.3173, type: 'locality' },
    { name: 'Sector 16', lat: 28.5832, lon: 77.3230, type: 'locality' },
    { name: 'Sector 18', lat: 28.5706, lon: 77.3207, type: 'locality' },
    { name: 'Sector 50', lat: 28.5700, lon: 77.3652, type: 'locality' },
    { name: 'Sector 62', lat: 28.6273, lon: 77.3677, type: 'locality' },
    { name: 'Sector 63', lat: 28.6270, lon: 77.3813, type: 'locality' },
    { name: 'Sector 76', lat: 28.5714, lon: 77.3815, type: 'locality' },
    { name: 'Sector 78', lat: 28.5640, lon: 77.3800, type: 'locality' },
    { name: 'Sector 137', lat: 28.4940, lon: 77.4070, type: 'locality' },
    { name: 'Noida Extension', lat: 28.5780, lon: 77.4380, type: 'suburb' },
    { name: 'Greater Noida West', lat: 28.6170, lon: 77.4380, type: 'suburb' },
    { name: 'Film City', lat: 28.5771, lon: 77.3301, type: 'locality' },
    { name: 'Botanical Garden', lat: 28.5642, lon: 77.3350, type: 'locality' }
  ],

  'Greater Noida': [
    { name: 'Alpha 1', lat: 28.4750, lon: 77.5040, type: 'locality' },
    { name: 'Alpha 2', lat: 28.4710, lon: 77.5100, type: 'locality' },
    { name: 'Beta 1', lat: 28.4650, lon: 77.5000, type: 'locality' },
    { name: 'Beta 2', lat: 28.4620, lon: 77.5050, type: 'locality' },
    { name: 'Gamma 1', lat: 28.4700, lon: 77.5300, type: 'locality' },
    { name: 'Gamma 2', lat: 28.4680, lon: 77.5350, type: 'locality' },
    { name: 'Delta 1', lat: 28.4580, lon: 77.5200, type: 'locality' },
    { name: 'Delta 2', lat: 28.4550, lon: 77.5250, type: 'locality' },
    { name: 'Knowledge Park I', lat: 28.4740, lon: 77.4850, type: 'locality' },
    { name: 'Knowledge Park II', lat: 28.4790, lon: 77.4900, type: 'locality' },
    { name: 'Knowledge Park III', lat: 28.4820, lon: 77.4950, type: 'locality' },
    { name: 'Knowledge Park IV', lat: 28.4860, lon: 77.5000, type: 'locality' },
    { name: 'Pari Chowk', lat: 28.4710, lon: 77.4990, type: 'locality' },
    { name: 'Techzone', lat: 28.4950, lon: 77.5100, type: 'locality' },
    { name: 'Chi Phi', lat: 28.4550, lon: 77.5450, type: 'locality' }
  ],

  'Ghaziabad': [
    { name: 'Indirapuram', lat: 28.6415, lon: 77.3739, type: 'suburb' },
    { name: 'Vasundhara', lat: 28.6603, lon: 77.3738, type: 'suburb' },
    { name: 'Vaishali', lat: 28.6492, lon: 77.3310, type: 'suburb' },
    { name: 'Kaushambi', lat: 28.6469, lon: 77.3260, type: 'suburb' },
    { name: 'Raj Nagar', lat: 28.6700, lon: 77.4350, type: 'suburb' },
    { name: 'Kavi Nagar', lat: 28.6676, lon: 77.4390, type: 'suburb' },
    { name: 'Crossings Republik', lat: 28.6376, lon: 77.4180, type: 'suburb' },
    { name: 'Loni', lat: 28.7526, lon: 77.2860, type: 'suburb' },
    { name: 'Sahibabad', lat: 28.6821, lon: 77.3586, type: 'suburb' },
    { name: 'Mohan Nagar', lat: 28.6740, lon: 77.4120, type: 'suburb' }
  ],

  'Gurgaon': [
    { name: 'DLF Phase 1', lat: 28.4750, lon: 77.1010, type: 'locality' },
    { name: 'DLF Phase 2', lat: 28.4820, lon: 77.0870, type: 'locality' },
    { name: 'DLF Phase 3', lat: 28.4960, lon: 77.0980, type: 'locality' },
    { name: 'DLF Phase 4', lat: 28.4650, lon: 77.0870, type: 'locality' },
    { name: 'DLF Phase 5', lat: 28.4745, lon: 77.1050, type: 'locality' },
    { name: 'Cyber City', lat: 28.4950, lon: 77.0870, type: 'locality' },
    { name: 'Udyog Vihar', lat: 28.4930, lon: 77.0820, type: 'locality' },
    { name: 'Sector 14', lat: 28.4595, lon: 77.0449, type: 'locality' },
    { name: 'Sector 29', lat: 28.4690, lon: 77.0650, type: 'locality' },
    { name: 'Sector 45', lat: 28.4460, lon: 77.0540, type: 'locality' },
    { name: 'Sector 46', lat: 28.4378, lon: 77.0507, type: 'locality' },
    { name: 'Sector 52', lat: 28.4430, lon: 77.0830, type: 'locality' },
    { name: 'Sector 56', lat: 28.4250, lon: 77.0980, type: 'locality' },
    { name: 'Golf Course Road', lat: 28.4590, lon: 77.0910, type: 'locality' },
    { name: 'Sohna Road', lat: 28.4140, lon: 77.0520, type: 'locality' },
    { name: 'Palam Vihar', lat: 28.5175, lon: 77.0370, type: 'suburb' },
    { name: 'Manesar', lat: 28.3644, lon: 76.9380, type: 'suburb' },
    { name: 'MG Road Gurgaon', lat: 28.4700, lon: 77.0750, type: 'locality' }
  ],

  'Faridabad': [
    { name: 'NIT Faridabad', lat: 28.3810, lon: 77.3030, type: 'suburb' },
    { name: 'Old Faridabad', lat: 28.4189, lon: 77.3158, type: 'suburb' },
    { name: 'Sector 14', lat: 28.4167, lon: 77.3050, type: 'locality' },
    { name: 'Sector 15', lat: 28.4167, lon: 77.3050, type: 'locality' },
    { name: 'Sector 16', lat: 28.4080, lon: 77.3100, type: 'locality' },
    { name: 'Sector 21', lat: 28.4250, lon: 77.3080, type: 'locality' },
    { name: 'Sector 28', lat: 28.4301, lon: 77.3150, type: 'locality' },
    { name: 'Sector 37', lat: 28.4500, lon: 77.3200, type: 'locality' },
    { name: 'Ballabhgarh', lat: 28.3420, lon: 77.3280, type: 'suburb' },
    { name: 'Surajkund Road', lat: 28.4950, lon: 77.2800, type: 'locality' },
    { name: 'Badkhal', lat: 28.4070, lon: 77.2950, type: 'suburb' }
  ],

  'Sonipat': [
    { name: 'Kundli', lat: 28.8805, lon: 77.1215, type: 'suburb' },
    { name: 'Murthal', lat: 29.0350, lon: 77.0630, type: 'suburb' },
    { name: 'Rai Industrial Area', lat: 28.9920, lon: 77.0560, type: 'locality' },
    { name: 'Sector 14 Sonipat', lat: 28.9921, lon: 77.0232, type: 'locality' },
    { name: 'Sector 15 Sonipat', lat: 28.9956, lon: 77.0310, type: 'locality' },
    { name: 'Ganaur', lat: 29.1376, lon: 76.9633, type: 'suburb' }
  ],

  'Bahadurgarh': [
    { name: 'Bahadurgarh City', lat: 28.6928, lon: 76.9270, type: 'suburb' },
    { name: 'MIE Bahadurgarh', lat: 28.6950, lon: 76.9350, type: 'locality' },
    { name: 'Sector 2 Bahadurgarh', lat: 28.6890, lon: 76.9200, type: 'locality' },
    { name: 'Sector 9 Bahadurgarh', lat: 28.6980, lon: 76.9280, type: 'locality' },
    { name: 'Sector 17 Bahadurgarh', lat: 28.7050, lon: 76.9350, type: 'locality' }
  ]
};

let stats = {
  totalCities: 0,
  totalAreas: 0,
  insertedAreas: 0,
  skippedAreas: 0,
  failedCities: [],
  startTime: Date.now()
};

async function insertAreasForCity(cityName, areas) {
  try {
    console.log(`\n📍 Processing ${cityName}...`);
    
    // Find city in database
    const cityDoc = await City.findOne({ 
      name: new RegExp(`^${cityName}$`, 'i')
    });

    if (!cityDoc) {
      console.log(`   ⚠️  ${cityName}: Not found in database, skipping`);
      stats.failedCities.push(cityName);
      return { success: false, cityName, reason: 'City not found in database' };
    }

    // Check existing areas
    const existingCount = await Area.countDocuments({ city_id: cityDoc._id });
    console.log(`   ℹ️  Existing areas: ${existingCount}`);

    // Transform to Area documents
    const areaDocuments = areas.map(area => ({
      osm_id: `manual/delhi-ncr/${cityName}/${area.name}`.toLowerCase().replace(/\s+/g, '-'),
      name: area.name,
      normalizedName: area.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
      city_id: cityDoc._id,
      cityName: cityDoc.name,
      cityOsmId: cityDoc.osm_id,
      placeType: area.type,
      location: {
        type: 'Point',
        coordinates: [area.lon, area.lat]
      },
      lat: area.lat,
      lon: area.lon,
      osmTags: { 
        source: 'manual_curated',
        verified: true,
        region: 'Delhi NCR',
        addedDate: new Date()
      },
      hasVendors: false,
      vendorCount: 0
    }));

    // Bulk insert
    const insertResult = await Area.insertMany(areaDocuments, { 
      ordered: false,
      rawResult: true 
    }).catch(err => {
      if (err.code === 11000) {
        const duplicates = err.writeErrors?.length || 0;
        const inserted = areaDocuments.length - duplicates;
        stats.skippedAreas += duplicates;
        return { insertedCount: inserted };
      }
      throw err;
    });

    const inserted = insertResult.insertedCount || 0;
    stats.insertedAreas += inserted;
    stats.totalAreas += areaDocuments.length;

    // Update city
    const totalCityAreas = existingCount + inserted;
    await City.findByIdAndUpdate(cityDoc._id, {
      areaCount: totalCityAreas,
      areasFetched: true,
      lastAreaUpdate: new Date()
    });

    console.log(`   ✅ ${cityName}: Added ${inserted} new areas (Total: ${totalCityAreas})`);
    return { success: true, cityName, inserted, total: totalCityAreas };

  } catch (error) {
    console.log(`   ❌ ${cityName}: Error - ${error.message}`);
    stats.failedCities.push(cityName);
    return { success: false, cityName, error: error.message };
  }
}

async function populateDelhiNCRAreasComprehensive() {
  try {
    console.log('\n🏛️  DELHI NCR COMPREHENSIVE AREA POPULATION');
    console.log('━'.repeat(80));
    console.log('📍 Populating complete Delhi NCT & NCR areas with accurate coordinates');
    console.log('━'.repeat(80));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n✅ Connected to MongoDB\n');

    const cityNames = Object.keys(DELHI_NCR_AREAS);
    stats.totalCities = cityNames.length;

    // Calculate total areas
    const totalAreasCount = Object.values(DELHI_NCR_AREAS).reduce(
      (sum, areas) => sum + areas.length, 0
    );

    console.log('📊 Dataset Overview:');
    console.log(`   • Cities: ${stats.totalCities}`);
    console.log(`   • Total areas: ${totalAreasCount}`);
    console.log('━'.repeat(80));

    console.log('\n📋 Area distribution by city:');
    for (const [city, areas] of Object.entries(DELHI_NCR_AREAS)) {
      console.log(`   • ${city.padEnd(20)}: ${areas.length} areas`);
    }
    console.log('━'.repeat(80));

    // Process each city
    const results = [];
    for (const cityName of cityNames) {
      const areas = DELHI_NCR_AREAS[cityName];
      const result = await insertAreasForCity(cityName, areas);
      results.push(result);
    }

    // Final statistics
    const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);
    const successfulCities = results.filter(r => r.success).length;
    
    console.log('\n' + '━'.repeat(80));
    console.log('🎉 DELHI NCR AREA POPULATION COMPLETE!');
    console.log('━'.repeat(80));
    console.log('📊 Statistics:');
    console.log(`   • Cities processed: ${successfulCities}/${stats.totalCities}`);
    console.log(`   • Areas prepared: ${totalAreasCount}`);
    console.log(`   • New areas inserted: ${stats.insertedAreas}`);
    console.log(`   • Duplicates skipped: ${stats.skippedAreas}`);
    console.log(`   • Processing time: ${duration} seconds`);
    console.log('━'.repeat(80));

    // Show successful cities
    console.log('\n✅ Successfully populated cities:');
    results.filter(r => r.success).forEach(r => {
      console.log(`   • ${r.cityName}: ${r.inserted} new areas (Total: ${r.total})`);
    });

    // Show failed cities if any
    if (stats.failedCities.length > 0) {
      console.log('\n⚠️  Cities not found in database (need to be added first):');
      stats.failedCities.forEach(city => {
        console.log(`   • ${city}`);
      });
    }

    // Total areas now in database
    const totalInDB = await Area.countDocuments();
    console.log('\n' + '━'.repeat(80));
    console.log(`🗃️  Total areas in database across all cities: ${totalInDB}`);
    console.log('━'.repeat(80));

    console.log('\n✅ Delhi NCR areas are now available for:');
    console.log('   • Vendor registration with precise locations');
    console.log('   • Geo-spatial search and filtering');
    console.log('   • Radius-based vendor discovery');
    console.log('   • City and area-based categorization\n');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n' + '━'.repeat(80));
    console.error('❌ ERROR OCCURRED');
    console.error('━'.repeat(80));
    console.error(`Message: ${error.message}`);
    console.error('\nStack trace:');
    console.error(error.stack);
    console.error('━'.repeat(80) + '\n');
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Script interrupted by user');
  console.log(`📊 Progress before interruption:`);
  console.log(`   • Areas inserted: ${stats.insertedAreas}`);
  console.log(`   • Time elapsed: ${((Date.now() - stats.startTime) / 1000).toFixed(2)}s`);
  
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
  
  process.exit(0);
});

// Run the script
populateDelhiNCRAreasComprehensive();
