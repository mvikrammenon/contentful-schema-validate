export interface BentoLayout {
  layoutType: string;
  targetContentType: string;
  positions: {
    [key: string]: {
      index: number;
      expectedTypes: string[];
    };
  };
  limits: {
    totalEntries: number;
    typeLimits: {
      [key: string]: number;
    };
  };
}

export interface CardEntry {
  sys: {
    id: string;
    contentType: {
      sys: {
        id: string;
      };
    };
  };
  // You might need to add other fields if your validation depends on them
  // e.g., fields: { [key: string]: any };
}
