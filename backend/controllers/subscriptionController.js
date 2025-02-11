// subscription.js (Controller)
import express from 'express';

const subscriptionPlans = [
  {
    name: "Basic Plan",
    price: "$9.99/month",
    features: [
      "Unlimited swipes",
      "Message other members",
      "Profile customization (limited)",
      "Basic search filters",
      "See who liked you (limited)",
      "Ad-free experience (limited)",
      "Message priority (within a limited timeframe)"
    ]
  },
  {
    name: "Silver Plan",
    price: "$14.99/month",
    features: [
      "All Basic Plan features",
      "Profile boosting (1 per month)",
      "Unlimited messaging",
      "Access to VIP events",
      "See who liked you (unlimited)",
      "Location-based search",
      "Profile customization (advanced)"
    ]
  },
  {
    name: "Bronze Plan",
    price: "$19.99/month",
    features: [
      "All Silver Plan features",
      "Priority support",
      "Advanced search filters",
      "Voice messages",
      "Video calls",
      "Advanced matchmaking algorithm",
      "No ads"
    ]
  },
  {
    name: "Gold Plan",
    price: "$29.99/month",
    features: [
      "All Bronze Plan features",
      "Increased profile length (more photos and details)",
      "Read receipts for messages",
      "Message priority (top of inbox)",
      "Incognito browsing mode",
      "Profile Super Likes (5 per month)",
      "Access to exclusive dating content",
      "Early access to new features"
    ]
  },
  {
    name: "Diamond Plan",
    price: "$49.99/month",
    features: [
      "All Gold Plan features",
      "Match with verified members",
      "Premium customer support (24/7)",
      "Personalized matchmaking service",
      "Increased profile boosting (3 per month)",
      "AI-based date planning suggestions",
      "Priority access to new features and events",
      "Exclusive discounts on VIP events and gifts"
    ]
  }
];

 export const getSubscription = (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      message: "Subscription plans fetched successfully",
      data: subscriptionPlans
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "There was an error fetching the subscription plans"
    });
  }
};


