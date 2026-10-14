import * as XLSX from 'xlsx';
import { generateVerhoeffChecksum } from './verhoeff';
import { generateLuhnChecksum } from './luhn';

/**
 * Creates a valid Aadhaar string that passes Verhoeff algorithm.
 */
function makeValidAadhaar(seed: number): string {
  // 11 digits starting with 2-9
  const prefix = (20000000000 + seed * 7891234).toString().slice(0, 11);
  const checksum = generateVerhoeffChecksum(prefix);
  return `${prefix}${checksum}`;
}

/**
 * Creates a valid Credit Card string that passes Luhn algorithm.
 */
function makeValidCard(prefix: string, seed: number): string {
  // Standard 16 digit card
  const body = `${prefix}${(100000000 + seed * 9871).toString().slice(0, 16 - prefix.length - 1)}`;
  const check = generateLuhnChecksum(body);
  return `${body}${check}`;
}

export function createSampleFiles(): File[] {
  // 1. customers_kyc.csv
  const csvRows = [
    'customer_id,full_name,email,phone,aadhaar_no,pan_number,dob,address',
    `CUST-1001,Aarav Sharma,aarav.sharma@gmail.com,+91 98201 44521,${makeValidAadhaar(1)},ABCPS1234F,1989-05-14,"Flat 402, Lotus Towers, Andheri West, Mumbai"`,
    `CUST-1002,Priya Patel,priya.patel@outlook.com,+91 94481 92831,${makeValidAadhaar(2)},BNZPP5678K,1993-11-20,"Plot 12, Sector 17, Gandhinagar, Gujarat"`,
    `CUST-1003,Vikramaditya Rao,v.rao@techcorp.in,+91 97112 39018,${makeValidAadhaar(3)},CLKPR9012M,1985-02-08,"34 Koramangala 4th Block, Bengaluru, Karnataka"`,
    `CUST-1004,Ananya Sen,ananya.sen@gmail.com,+91 88204 77123,${makeValidAadhaar(4)},DEWPS3456T,1996-08-30,"77 Park Street, Kolkata, West Bengal"`,
    `CUST-1005,Rohan Mehra,rohan.mehra@yahoo.co.in,+91 79901 23456,${makeValidAadhaar(5)},FGTPM7890L,1990-12-15,"15 Connaught Place, New Delhi"`,
    `CUST-1006,Sunita Deshmukh,sunita.d@rediffmail.com,+91 96541 88720,${makeValidAadhaar(6)},GHJPD2345H,1982-07-22,"Flat 10B, Shivaji Park, Dadar, Mumbai"`,
    `CUST-1007,Kabir Nambiar,kabir.n@gmail.com,+91 91234 56789,${makeValidAadhaar(7)},HJKPN6789G,1998-04-18,"12 Marine Drive, Kochi, Kerala"`
  ].join('\n');

  const csvFile = new File([csvRows], 'customers_kyc.csv', { type: 'text/csv' });

  // 2. employees_payroll.xlsx
  const payrollData = [
    {
      Employee_ID: 'EMP-0891',
      Employee_Name: 'Deepak Verma',
      Bank_Account: '50100428912345',
      IFSC_Code: 'HDFC0001234',
      Corporate_Card: makeValidCard('4215', 101),
      PAN: 'AXZPV8812D',
      Salary_INR: 125000
    },
    {
      Employee_ID: 'EMP-0892',
      Employee_Name: 'Meera Iyer',
      Bank_Account: '200192837465',
      IFSC_Code: 'SBIN0004521',
      Corporate_Card: makeValidCard('5241', 102),
      PAN: 'BRTPI4432Q',
      Salary_INR: 160000
    },
    {
      Employee_ID: 'EMP-0893',
      Employee_Name: 'Aditya Chawla',
      Bank_Account: '003492817462',
      IFSC_Code: 'ICIC0000987',
      Corporate_Card: makeValidCard('4532', 103),
      PAN: 'CMPPC9018A',
      Salary_INR: 98000
    },
    {
      Employee_ID: 'EMP-0894',
      Employee_Name: 'Kavita Nair',
      Bank_Account: '91201004829102',
      IFSC_Code: 'UTIB0000142',
      Corporate_Card: makeValidCard('5521', 104),
      PAN: 'DRTPN2398K',
      Salary_INR: 145000
    },
    {
      Employee_ID: 'EMP-0895',
      Employee_Name: 'Sanjay Mukherjee',
      Bank_Account: '302918273645',
      IFSC_Code: 'PUNB0021300',
      Corporate_Card: makeValidCard('4111', 105),
      PAN: 'EKZPM7714C',
      Salary_INR: 110000
    }
  ];

  const ws = XLSX.utils.json_to_sheet(payrollData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Staff_Payroll');
  const xlsxBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const xlsxFile = new File([xlsxBuffer], 'employees_payroll.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  // 3. server_access_logs.txt
  const logLines = [
    '# Nginx Production Access Log - Node ap-south-1',
    '103.24.18.91 - - [12/Oct/2026:14:22:10 +0530] "GET /api/v2/user/verify?email=support.lead@enterprise.com&phone=9820011223 HTTP/1.1" 200 452 "-" "Mozilla/5.0"',
    '115.112.44.182 - - [12/Oct/2026:14:23:45 +0530] "POST /auth/login HTTP/1.1" 200 892 "https://app.privacylens.internal" "Mozilla/5.0"',
    '49.36.128.55 - - [12/Oct/2026:14:24:02 +0530] "GET /api/v1/customer/search?pan=AZZPS9988K HTTP/1.1" 200 1204 "-" "MobileApp/1.4.0"',
    '182.74.22.10 - - [12/Oct/2026:14:25:30 +0530] "POST /payment/webhook?client_ip=182.74.22.10&card_type=visa HTTP/1.1" 200 156 "-" "PaymentGateway-Agent"',
    '103.151.48.22 - - [12/Oct/2026:14:26:18 +0530] "GET /api/v2/telecom/otp?mobile=9711884422 HTTP/1.1" 200 68 "-" "AndroidClient"',
    '157.48.221.78 - - [12/Oct/2026:14:27:01 +0530] "GET /healthz HTTP/1.1" 200 12 "-" "Kubernetes-Prober"',
    '117.211.89.34 - - [12/Oct/2026:14:28:11 +0530] "GET /portal/account?email=finance.audit@fintech.in HTTP/1.1" 200 782 "-" "Safari/18.0"'
  ].join('\n');

  const txtFile = new File([logLines], 'server_access_logs.txt', { type: 'text/plain' });

  // 4. client_dossiers.json
  const jsonData = [
    {
      id: 'USR-891',
      profile: {
        full_name: 'Tanvi Singhania',
        email: 'tanvi.s@singhania-law.com',
        phone: '+91 99887 76655',
        passport: 'T7819204',
        dob: '1987-03-24'
      },
      residence: {
        address: '5th Avenue, Altamount Road, Mumbai, Maharashtra',
        city: 'Mumbai',
        pincode: '400026'
      }
    },
    {
      id: 'USR-892',
      profile: {
        full_name: 'Rajeshwer Pillai',
        email: 'r.pillai@coastalshipping.in',
        phone: '+91 98451 22334',
        passport: 'P4567891',
        dob: '1979-09-12'
      },
      residence: {
        address: 'Harbour View Enclave, Willingdon Island, Kochi',
        city: 'Kochi',
        pincode: '682003'
      }
    }
  ];

  const jsonFile = new File([JSON.stringify(jsonData, null, 2)], 'client_dossiers.json', {
    type: 'application/json'
  });

  return [csvFile, xlsxFile, txtFile, jsonFile];
}
