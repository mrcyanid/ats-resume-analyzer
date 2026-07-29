import { Link } from "react-router-dom";
import "./index.css";

const Home = () => {
  const token = localStorage.getItem("token");

  return (
    <div className="home-container">
      <h1>AI-Powered ATS Resume Analyzer</h1>
      <p>
        Upload your resume, paste a job description, and get an instant ATS
        compatibility score along with AI-powered suggestions to improve
        your chances of getting shortlisted.
      </p>
      <Link to={token ? "/resumes" : "/register"} className="cta-btn">
        {token ? "Analyze Your Resume" : "Get Started"}
      </Link>
    </div>
  );
};

export default Home;
