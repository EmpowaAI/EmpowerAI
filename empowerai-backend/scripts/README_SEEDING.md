# Seeding Opportunities Database

## Where to Get Real Data

### Sources for Real South African Opportunities:

1. **Company Career Pages** (Most Reliable)
   - Standard Bank: https://www.standardbank.co.za/standardbank/Personal/Careers
   - Capitec: https://www.capitecbank.co.za/careers
   - FNB: https://www.fnb.co.za/careers
   - Nedbank: https://www.nedbank.co.za/content/nedbank/desktop/gt/en/careers.html
   - Discovery: https://www.discovery.co.za/careers
   - Takealot: https://www.takealot.com/careers
   - MTN: https://www.mtn.co.za/careers
   - Woolworths: https://www.woolworths.co.za/careers
   - Shoprite: https://www.shopriteholdings.co.za/careers

2. **Government SETAs** (Skills Development)
   - MICT SETA: https://www.mict.org.za (IT learnerships)
   - BankSETA: https://www.bankseta.org.za (Banking learnerships)
   - Services SETA: https://www.serviceseta.org.za (Service sector)
   - Many others: Search "SETAs South Africa"

3. **Bursary Providers**
   - NSFAS: https://www.nsfas.org.za
   - Eskom: https://www.eskom.co.za/careers/bursaries
   - Transnet: https://www.transnet.net/Careers
   - Many companies offer bursaries - check their career pages

4. **Job Boards**
   - PNet: https://www.pnet.co.za
   - Careers24: https://www.careers24.com
   - Indeed South Africa: https://www.indeed.co.za
   - LinkedIn Jobs: https://www.linkedin.com/jobs

5. **Youth Programs**
   - YES4Youth: https://yes4youth.co.za (YES Program)
   - Harambee: https://harambee.co.za
   - Nasi iSpani: https://www.nasiispani.gov.za (Gauteng govt)

6. **Training Providers**
   - WeThinkCode: https://www.wethinkcode.co.za
   - CodeSpace: https://www.codespace.co.za
   - Umuzi: https://www.umuzi.org

## How to Add New Opportunities

1. **Visit the source** (company website, SETA portal, job board)
2. **Find a real opportunity** that fits one of these types:
   - `learnership` - Training programs (12-18 months, stipend provided)
   - `internship` - Short-term work experience (3-12 months)
   - `job` - Full-time or part-time employment
   - `bursary` - Educational funding
   - `freelance` - Contract/freelance work

3. **Extract the information**:
   - Title (e.g., "Software Development Learnership")
   - Company/Organization name
   - Location and province(s)
   - Type (learnership/internship/job/bursary/freelance)
   - Description (copy from the posting)
   - Requirements (list as array: ["Matric", "Age 18-35", etc.])
   - Skills needed (list as array: ["JavaScript", "Communication", etc.])
   - Salary/stipend range (if available)
   - Deadline (if specified)
   - Application URL (direct link to apply)

4. **Add to seedOpportunities.js**:
   ```javascript
   {
     title: "Real Opportunity Title",
     type: "learnership", // or "internship", "job", "bursary", "freelance"
     company: "Real Company Name",
     location: "City Name",
     province: ["Province Name"],
     description: "Real description from posting...",
     requirements: ["Requirement 1", "Requirement 2"],
     skills: ["Skill 1", "Skill 2"],
     salaryRange: { min: 4000, max: 8000 }, // Or { min: 0, max: 0 } for bursaries
     deadline: new Date('2025-05-30'), // Or null for ongoing
     applicationUrl: "https://real-application-url.com",
     isActive: true
   }
   ```

## Running the Seed Script

### Local Development:
```bash
cd empowerai-backend
npm run seed:opportunities
```

Or directly:
```bash
node scripts/seedOpportunities.js
```

### Important Notes:
- The script will **delete all existing opportunities** and insert new ones
- Make sure `MONGODB_URI` is set in your `.env` file
- The script will show a summary of what was inserted

## Keeping Data Up-to-Date

### Recommended Approach:
1. **Weekly Updates**: Check major sources weekly for new opportunities
2. **Monthly Cleanup**: Remove expired opportunities (past deadline)
3. **Partner with Organizations**: Contact companies directly for permission to list their opportunities
4. **Automate Where Possible**: 
   - Some SETAs have RSS feeds
   - Job boards may have APIs (check terms of service)
   - Consider web scraping (with permission and legal compliance)

### Legal Considerations:
- ✅ **OK**: Manually copying publicly available job postings
- ✅ **OK**: Using information from company careers pages
- ⚠️ **Check**: Web scraping (respect robots.txt, terms of service)
- ❌ **Avoid**: Copyrighted content, premium job board content without permission
- ✅ **Best Practice**: Partner with companies/SETAs for official listings

## Current Data Status

The seed script includes **20+ real opportunities** from:
- Major South African banks (Standard Bank, Capitec, FNB, Nedbank)
- Tech companies (Takealot, Dimension Data, MTN)
- SETAs (MICT SETA, BankSETA, Services SETA)
- Retailers (Woolworths, Shoprite)
- Bursary providers (NSFAS, Eskom)
- Freelance platforms

**Types Covered**:
- Learnerships (IT, Software Dev, Data Science, Digital Marketing, Banking, Retail)
- Internships (Software Engineering, Data Analytics, IT Support)
- Entry-Level Jobs (Frontend Developer, Customer Service, Data Analyst, Graduate Trainee)
- Bursaries (Computer Science, Engineering)
- Freelance (Web Development, Content Writing)

**Provinces Covered**:
- Gauteng, Western Cape, KwaZulu-Natal, Eastern Cape, Free State, Limpopo, Mpumalanga, Northern Cape, North West

## Future Enhancements

1. **API Integration**: Partner with job boards for live feeds
2. **Company Partnerships**: Official listings from partner companies
3. **User Submissions**: Allow users to submit opportunities
4. **Automatic Expiry**: Mark opportunities as inactive after deadline
5. **Categorization**: Add more specific categories (remote, part-time, etc.)
