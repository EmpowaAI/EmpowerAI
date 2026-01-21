# Seeding the Database with Opportunities

Before users can test the application, the database needs to be populated with opportunities data.

## Quick Method: API Endpoint (Recommended)

The easiest way to seed the production database is via the admin API endpoint:

```bash
curl -X POST https://empowerai.onrender.com/api/admin/seed-opportunities
```

This will:
- Clear existing opportunities
- Insert 20+ curated South African opportunities (learnerships, internships, jobs, bursaries)
- Return a success message with count

## Alternative Method: Render Shell

If you prefer to run the script directly:

1. Go to your Render dashboard
2. Select the `empowerai-backend` service
3. Click on "Shell" tab
4. Run:
   ```bash
   cd /opt/render/project/src/empowerai-backend
   npm run seed:opportunities
   ```

## What Gets Seeded

The seed script adds:
- **Learnerships** (IT Support, Software Development, Financial Services, Retail Management)
- **Internships** (Tech companies, Banks, Government)
- **Entry-Level Jobs** (Various industries)
- **Bursaries** (Engineering, IT, Business)
- **Freelance Opportunities** (Remote work)

All opportunities include:
- Company names
- Locations and provinces
- Descriptions
- Requirements
- Skills needed
- Salary ranges (where applicable)
- Application URLs
- Deadlines

## Verify Seeding

Check if opportunities were seeded:

```bash
curl https://empowerai.onrender.com/api/admin/stats
```

Or visit the Opportunities page in the frontend after seeding.

## Notes

- The seed script clears existing opportunities before inserting new ones
- Opportunities are marked as `isActive: true` by default
- All opportunities are real South African opportunities curated from public sources
- You can run the seed script multiple times (it will replace existing data)
