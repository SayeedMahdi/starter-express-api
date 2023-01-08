const packages = [
  {
    name: "Fly Package",
    type: "limited",
    city: "Herat",
    capacity: {
      hour24: "30 GB",
    },
    speed: {
      hour24: {
        speed: "1 Mbps",
        time: "24 Hours",
      },
    },
    price: 700,
    duration: 30,
    priority: 2,
    description: "description of a package",
    propperties: ["1mb, 1 Month, Limited, 24"],
    category: "Limited-24-Hours",
  },
  {
    name: "s1",
    type: "unlimited",
    city: "Herat",
    speed: {
      daily: {
        speed: "320 kbps",
        from: "8 AM",
        to: "8 PM",
      },
      nightly: {
        speed: "480 kbps",
        from: "8 PM",
        to: "8 AM",
      },
    },
    price: 1000,
    duration: 30,
    capacity: {
      daily: "30 GB",
    },
    priority: 1,
    description: "description of a package",
    propperties: ["Dedicated, Unlimited"],
    category: "Unlimited",
  },
  {
    name: "Rahanet Plus",
    type: "limited",
    city: "Mazar",
    capacity: {
      daily: "30 GB",
    },
    speed: {
      daily: {
        speed: "320 kpbs",
        from: "8 AM",
        to: "8 PM",
      },
      nightly: {
        speed: "480 kbps",
        from: "8 PM",
        to: "8 AM",
      },
    },
    price: 1400,
    duration: 30,
    priority: 3,
    description: "description of a package",
    propperties: ["Dedicated, Unlimited, s1+"],
    category: "Unlimited",
  },
  {
    name: "30 GB",
    type: "limited",
    city: "Herat",
    capacity: {
      nightly: "30 GB",
    },
    speed: {
      nightly: {
        speed: "1 Mbps",
        from: "6 PM",
        to: "6 AM",
      },
    },
    price: 700,
    duration: 30,
    priority: 4,
    description: "description of a package",
    propperties: ["Limited"],
    category: "Limited-Nightly",
  },
  {
    name: "60 GB",
    type: "limited",
    city: "Herat",
    capacity: 5,
    speed: {
      daily: {
        speed: "2 Mbps",
        type: "daily",
      },
      nightly: {
        speed: "256 kbps",
        type: "after-daily",
      },
    },
    price: 1100,
    duration: 30,
    priority: 4,
    description: "description of a package",
    propperties: ["Hybrid"],
    category: "Hybrid",
  },
  {
    name: "60GB",
    type: "limited",
    city: "Herat",
    speed: {
      daily: {
        speed: "2 Mbps",
      },
      nightly: {
        speed: "2 Mbps",
        from: "12 AM",
        to: "7 AM",
      },
    },
    price: 110,
    duration: 30,
    capacity: {
      daily: "60 GB",
      nightly: "Free",
    },
    priority: 6,
    description: "description of a package",
    propperties: ["Nightly Free"],
    category: "Nightly-Free",
  },
  {
    name: "Senna Package",
    type: "unlimited",
    city: "Herat",
    speed: {
      daily: {
        speed: "1 Mbps",
        from: "6 AM",
        to: "6 PM",
      },
      nightly: {
        speed: "256 Kbps",
        from: "6 PM",
        to: "6 PM",
      },
    },
    price: 1500,
    duration: 30,
    capacity: {
      daily: "60 GB",
      nightly: "Free",
    },
    priority: 6,
    description: "description of a package",
    propperties: ["Promotion, unlimited"],
    category: "Promotion",
  },
];

export default packages;
