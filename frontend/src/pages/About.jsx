import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion"; // Import motion

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - Luxe Heritage</title>
        <meta
          name="description"
          content="Learn about Luxe Heritage, our mission, and our commitment to luxury fashion."
        />
      </Helmet>

      {/* The existing CSS classes (mx-auto, md:grid-cols-2, and responsive text sizes) make this component responsive for all standard device sizes. */}
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16" // Increased margin
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">
              {" "}
              {/* Use text-primary */}
              About Luxe Heritage
            </h1>
            <p className="text-xl text-muted">Redefining Luxury Fashion</p>{" "}
            {/* Use text-muted */}
          </motion.div>

          {/* Use motion for staggered animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="card-luxury p-8 md:p-10 mb-10" // Use luxury card, adjusted padding/margin
          >
            <h2 className="text-3xl font-semibold text-primary mb-4">
              {" "}
              {/* Use text-primary */}
              Our Story
            </h2>
            <p className="text-primary mb-4 leading-relaxed">
              {" "}
              {/* Use text-primary, adjusted line height */}
              Founded with a vision to bring the finest luxury fashion to
              discerning customers worldwide, Luxe Heritage represents the
              pinnacle of elegance and sophistication.
            </p>
            <p className="text-primary leading-relaxed">
              {" "}
              {/* Use text-primary */}
              Our curated collection features handpicked pieces from the world's
              most renowned designers, ensuring that every item in our catalog
              meets the highest standards of quality and craftsmanship.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 mb-10">
            {" "}
            {/* Increased gap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="card-luxury p-8" // Use luxury card
            >
              <h3 className="text-2xl font-semibold text-primary mb-3">
                {" "}
                {/* Use text-primary */}
                Our Mission
              </h3>
              <p className="text-primary leading-relaxed">
                {" "}
                {/* Use text-primary */}
                To provide an unparalleled shopping experience that celebrates
                individuality, craftsmanship, and the timeless art of luxury
                fashion.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="card-luxury p-8" // Use luxury card
            >
              <h3 className="text-2xl font-semibold text-primary mb-4">
                {" "}
                {/* Use text-primary */}
                Our Values
              </h3>
              <ul className="text-primary space-y-3">
                {" "}
                {/* Increased spacing */}
                {/* Added small accent icons */}
                <li className="flex items-center">
                  <span className="text-accent mr-2">•</span> Authenticity and
                  Quality
                </li>
                <li className="flex items-center">
                  <span className="text-accent mr-2">•</span> Exceptional
                  Customer Service
                </li>
                <li className="flex items-center">
                  <span className="text-accent mr-2">•</span> Sustainable Luxury
                </li>
                <li className="flex items-center">
                  <span className="text-accent mr-2">•</span> Innovation and
                  Tradition
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="card-luxury p-8 md:p-10" // Use luxury card
          >
            <h2 className="text-3xl font-semibold text-primary mb-6">
              {" "}
              {/* Use text-primary */}
              Contact Us
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {" "}
              {/* Increased gap */}
              <div>
                <h4 className="font-semibold text-primary mb-2 text-lg">
                  {" "}
                  {/* Increased size */}
                  Customer Service
                </h4>
                <p className="text-muted hover:text-accent transition-colors">
                  {" "}
                  {/* Use text-muted */}
                  <a href="mailto:support@luxeheritage.com">
                    support@luxeheritage.com
                  </a>
                </p>
                <p className="text-muted hover:text-accent transition-colors">
                  {" "}
                  {/* Use text-muted */}
                  <a href="tel:1-800-LUXE-HER">1-800-LUXE-HER</a>
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2 text-lg">
                  {" "}
                  {/* Increased size */}
                  Business Hours
                </h4>
                <p className="text-muted">
                  Monday - Friday: 9AM - 6PM EST
                </p>{" "}
                {/* Use text-muted */}
                <p className="text-muted">
                  Saturday - Sunday: 10AM - 4PM EST
                </p>{" "}
                {/* Use text-muted */}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default About;
