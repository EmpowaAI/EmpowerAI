const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  LevelFormat,
  TabStopType,
  TabStopPosition,
  HeadingLevel,
  WidthType,
} = require('docx');

/**
 * Builds a professional DOCX buffer from the revamped CV object
 * returned by the AI service (revamp.revamped_cv).
 *
 * @param {object} revampedCv
 * @returns {Promise<Buffer>}
 */
async function buildCVDocx(revampedCv) {
  const {
    name,
    contact        = {},
    professional_summary,
    technical_skills   = {},
    professional_experience = [],
    education      = [],
    projects       = [],
    certifications = [],
    languages      = [],
  } = revampedCv || {};

  const children = [];

  // ── Helpers ────────────────────────────────────────────────────────────────

  const sectionDivider = () =>
    new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: '2C5282', space: 1 },
      },
      spacing: { before: 160, after: 80 },
      children: [],
    });

  const sectionHeading = (text) =>
    new Paragraph({
      spacing: { before: 200, after: 60 },
      children: [
        new TextRun({
          text: text.toUpperCase(),
          bold: true,
          size: 22,
          color: '2C5282',
          font: 'Calibri',
        }),
      ],
    });

  const bulletPara = (text) =>
    new Paragraph({
      numbering: { reference: 'cv-bullets', level: 0 },
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: text || '', size: 20, font: 'Calibri', color: '1A202C' })],
    });

  const bodyPara = (text, opts = {}) =>
    new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({
          text: text || '',
          size: opts.size || 20,
          bold: opts.bold || false,
          italics: opts.italics || false,
          color: opts.color || '1A202C',
          font: 'Calibri',
        }),
      ],
    });

  const roleHeaderPara = (left, leftBold, right) =>
    new Paragraph({
      spacing: { before: 120, after: 20 },
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      children: [
        new TextRun({ text: left || '', bold: leftBold, size: 22, font: 'Calibri', color: '1A202C' }),
        new TextRun({ text: '\t', font: 'Calibri' }),
        new TextRun({ text: right || '', size: 18, italics: true, color: '718096', font: 'Calibri' }),
      ],
    });

  // ── 1. Name ────────────────────────────────────────────────────────────────
  if (name) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({ text: name, bold: true, size: 44, color: '1A202C', font: 'Calibri' }),
        ],
      })
    );
  }

  // ── 2. Contact line ────────────────────────────────────────────────────────
  const contactParts = [
    contact.location,
    contact.phone,
    contact.email,
    contact.linkedin,
    contact.github,
    contact.portfolio,
  ].filter(Boolean);

  if (contactParts.length) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: contactParts.flatMap((part, i) => [
          new TextRun({ text: part, size: 18, color: '4A5568', font: 'Calibri' }),
          ...(i < contactParts.length - 1
            ? [new TextRun({ text: '  |  ', size: 18, color: '9CA3AF', font: 'Calibri' })]
            : []),
        ]),
      })
    );
  }

  // ── 3. Professional Summary ────────────────────────────────────────────────
  if (professional_summary) {
    children.push(sectionHeading('Professional Summary'));
    children.push(sectionDivider());
    children.push(
      new Paragraph({
        spacing: { before: 80, after: 80 },
        children: [
          new TextRun({
            text: professional_summary,
            size: 20,
            italics: true,
            color: '2D3748',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  // ── 4. Technical Skills ───────────────────────────────────────────────────
  const skillCategories = [
    { label: 'Languages',              key: 'languages' },
    { label: 'Frameworks & Libraries', key: 'frameworks_libraries' },
    { label: 'Web Technologies',       key: 'web_technologies' },
    { label: 'Tools & Platforms',      key: 'tools_platforms' },
    { label: 'Testing Frameworks',     key: 'testing_frameworks' },
    { label: 'Methodologies',          key: 'methodologies' },
  ].filter(({ key }) => technical_skills[key]?.length);

  if (skillCategories.length) {
    children.push(sectionHeading('Technical Skills'));
    children.push(sectionDivider());

    for (const { label, key } of skillCategories) {
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 40 },
          children: [
            new TextRun({ text: `${label}: `, bold: true, size: 20, font: 'Calibri', color: '2C5282' }),
            new TextRun({ text: technical_skills[key].join(' • '), size: 20, font: 'Calibri', color: '2D3748' }),
          ],
        })
      );
    }
  }

  // ── 5. Professional Experience ────────────────────────────────────────────
  if (professional_experience.length) {
    children.push(sectionHeading('Professional Experience'));
    children.push(sectionDivider());

    for (const job of professional_experience) {
      children.push(roleHeaderPara(job.title, true, job.dates));
      children.push(bodyPara(job.company, { color: '4A5568' }));
      for (const bullet of job.responsibilities || []) {
        children.push(bulletPara(bullet));
      }
      children.push(new Paragraph({ spacing: { before: 60, after: 0 }, children: [] }));
    }
  }

  // ── 6. Projects ───────────────────────────────────────────────────────────
  if (projects.length) {
    children.push(sectionHeading('Projects'));
    children.push(sectionDivider());

    for (const proj of projects) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 20 },
          children: [
            new TextRun({ text: proj.name || '', bold: true, size: 21, font: 'Calibri', color: '2C5282' }),
          ],
        })
      );

      if (proj.technologies?.length) {
        children.push(
          new Paragraph({
            spacing: { before: 20, after: 30 },
            children: [
              new TextRun({ text: 'Technologies: ', bold: true, size: 18, font: 'Calibri', color: '4A5568' }),
              new TextRun({ text: proj.technologies.join(', '), size: 18, italics: true, font: 'Calibri', color: '718096' }),
            ],
          })
        );
      }

      for (const achievement of proj.achievements || []) {
        children.push(bulletPara(achievement));
      }

      children.push(new Paragraph({ spacing: { before: 40, after: 0 }, children: [] }));
    }
  }

  // ── 7. Education ──────────────────────────────────────────────────────────
  if (education.length) {
    children.push(sectionHeading('Education'));
    children.push(sectionDivider());

    for (const edu of education) {
      children.push(roleHeaderPara(edu.degree, true, edu.year));
      children.push(bodyPara(edu.institution, { color: '4A5568' }));
      children.push(new Paragraph({ spacing: { before: 40, after: 0 }, children: [] }));
    }
  }

  // ── 8. Certifications ─────────────────────────────────────────────────────
  if (certifications.length) {
    children.push(sectionHeading('Certifications'));
    children.push(sectionDivider());
    for (const cert of certifications) {
      children.push(bulletPara(typeof cert === 'string' ? cert : cert.name));
    }
  }

  // ── 9. Languages ──────────────────────────────────────────────────────────
  if (languages.length) {
    children.push(sectionHeading('Languages'));
    children.push(sectionDivider());
    for (const lang of languages) {
      const text = lang.proficiency
        ? `${lang.language} — ${lang.proficiency}`
        : lang.language || String(lang);
      children.push(bulletPara(text));
    }
  }

  // ── Assemble Document ─────────────────────────────────────────────────────
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'cv-bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: { indent: { left: 440, hanging: 220 } },
                run: { font: 'Calibri', size: 20 },
              },
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 20, color: '1A202C' } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

module.exports = { buildCVDocx };
