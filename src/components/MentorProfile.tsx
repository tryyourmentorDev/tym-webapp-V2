import React, { useState } from "react";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Globe,
  MessageCircle,
  Calendar,
  Heart,
  Share,
} from "lucide-react";
import type { Mentor } from "../App";

interface MentorProfileProps {
  mentor: Mentor;
  onBack: () => void;
  onBackToHome: () => void;
}

export const MentorProfile: React.FC<MentorProfileProps> = ({
  mentor,
  onBack,
  onBackToHome,
}) => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    // In a real app, this would send the message
    alert(`Message sent to ${mentor.name}!`);
    setShowContactForm(false);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBackToHome}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Try Your Mentor
              </span>
            </button>
          </div>
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Discovery
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            <img
              src={mentor.image}
              alt={mentor.name}
              className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
            />

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {mentor.name}
                  </h1>
                  <p className="text-xl text-gray-600 mb-1">{mentor.title}</p>
                  <p className="text-lg text-gray-500">{mentor.company}</p>
                </div>

                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Share className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="font-semibold">{mentor.rating}</span>
                  <span className="text-gray-600 ml-1">
                    ({mentor.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-2" />
                  <span
                    className={`font-medium ${
                      mentor.availability === "Available"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {mentor.availability}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">{mentor.location}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    {mentor.languages.join(", ")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Send Message
                </button>
                <button className="flex items-center justify-center px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Call
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{mentor.bio}</p>
            </div>

            {/* Expertise */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Areas of Expertise
              </h2>
              <div className="flex flex-wrap gap-3">
                {mentor.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Key Achievements
              </h2>
              <ul className="space-y-3">
                {mentor.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Recent Reviews
              </h2>
              <div className="space-y-6">
                {[
                  {
                    name: "Alex Thompson",
                    role: "Software Engineer",
                    rating: 5,
                    comment:
                      "Incredible mentor! Helped me transition from junior to senior engineer in just 8 months.",
                    date: "2 weeks ago",
                  },
                  {
                    name: "Jessica Liu",
                    role: "Product Manager",
                    rating: 5,
                    comment:
                      "Amazing guidance on product strategy. Very knowledgeable and patient.",
                    date: "1 month ago",
                  },
                  {
                    name: "Michael Chen",
                    role: "Data Scientist",
                    rating: 4,
                    comment:
                      "Great insights into machine learning and career development. Highly recommend!",
                    date: "2 months ago",
                  },
                ].map((review, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {review.name}
                        </h4>
                        <p className="text-sm text-gray-600">{review.role}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">
                          {review.date}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience Level:</span>
                  <span className="font-medium text-gray-900">
                    {mentor.experience}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Industry:</span>
                  <span className="font-medium text-gray-900">
                    {mentor.industry}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Rate:</span>
                  <span className="font-medium text-green-600">100%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Response Time:</span>
                  <span className="font-medium text-gray-900">
                    &lt; 24 hours
                  </span>
                </div>
              </div>
            </div>

            {/* Similar Mentors */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Similar Mentors
              </h3>
              <div className="space-y-4">
                {[
                  {
                    name: "John Smith",
                    title: "Senior Engineer at Meta",
                    rating: 4.8,
                  },
                  {
                    name: "Lisa Wang",
                    title: "Tech Lead at Amazon",
                    rating: 4.9,
                  },
                  {
                    name: "Carlos Rodriguez",
                    title: "Principal Engineer at Tesla",
                    rating: 4.7,
                  },
                ].map((similar, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {similar.name}
                      </p>
                      <p className="text-gray-600 text-xs truncate">
                        {similar.title}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 mr-1" />
                      <span className="text-xs text-gray-600">
                        {similar.rating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Send Message to {mentor.name}
            </h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain what you'd like to learn..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Send Message
              </button>
              <button
                onClick={() => setShowContactForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
