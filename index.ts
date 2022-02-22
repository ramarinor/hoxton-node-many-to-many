import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 4000;

const db = new Database('./data.db', {
  verbose: console.log
});

const getAllApplicants = db.prepare(`
SELECT * FROM applicants;
`);

const getApplicantById = db.prepare(`
SELECT * FROM applicants WHERE id = ?;
`);

const getInterviewsByApllicantId = db.prepare(`
SELECT interviews.id,interviews.score,interviews.date,interviews.interviewerId,interviews.score,interviewers.name as interviewerName FROM interviews
JOIN interviewers ON interviewers.id = interviews.interviewerId
WHERE interviews.applicantId = ?;
`);

app.get('/applicants', (req, res) => {
  const applicants = getAllApplicants.all();

  for (const applicant of applicants) {
    const interviews = getInterviewsByApllicantId.all(applicant.id);
    applicant.interviews = interviews;
  }

  res.send(applicants);
});

app.get('/applicants/:id', (req, res) => {
  const id = req.params.id;
  const applicant = getApplicantById.get(id);
  if (applicant) {
    const interviews = getInterviewsByApllicantId.all(applicant.id);
    applicant.interviews = interviews;
    res.send(applicant);
  } else {
    res.status(404).send({ error: 'Applicant not found!' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is up and running on http://localhost:${PORT}`);
});
