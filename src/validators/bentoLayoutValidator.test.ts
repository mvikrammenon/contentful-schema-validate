import { validateBentoLayout, ValidationError } from './bentoLayoutValidator';
import { BentoLayout, CardEntry } from '../interfaces/BentoLayout';

// Mock Data
const mockBentoLayout: BentoLayout = {
  layoutType: 'bento-1-2',
  targetContentType: 'tabsContainer',
  positions: {
    leftColumnFullHeightCard: { index: 0, expectedTypes: ['CardTypeA'] },
    rightColumnTopCard: { index: 1, expectedTypes: ['CardTypeB', 'CardTypeC'] },
    rightColumnBottomCard: { index: 2, expectedTypes: ['CardTypeB'] },
  },
  limits: {
    totalEntries: 3,
    typeLimits: {
      CardTypeA: 1,
      CardTypeB: 2,
      CardTypeC: 1,
    },
  },
};

const createMockCard = (id: string, contentTypeId: string): CardEntry => ({
  sys: {
    id,
    contentType: {
      sys: {
        id: contentTypeId,
      },
    },
  },
});

describe('validateBentoLayout', () => {
  it('should return no errors for a valid layout', () => {
    const cards: CardEntry[] = [
      createMockCard('card1', 'CardTypeA'),
      createMockCard('card2', 'CardTypeB'),
      createMockCard('card3', 'CardTypeB'),
    ];
    const errors = validateBentoLayout(mockBentoLayout, cards);
    expect(errors).toEqual([]);
  });

  it('should return error if totalEntries do not match', () => {
    const cards: CardEntry[] = [
      createMockCard('card1', 'CardTypeA'),
      createMockCard('card2', 'CardTypeB'),
    ]; // Only 2 cards
    const errors = validateBentoLayout(mockBentoLayout, cards);
    expect(errors).toContainEqual({
      message: 'Expected 3 cards, but found 2.',
      type: 'error',
    });
  });

  it('should return error if card type is incorrect for its position', () => {
    const cards: CardEntry[] = [
      createMockCard('card1', 'CardTypeB'), // Incorrect, expected CardTypeA
      createMockCard('card2', 'CardTypeB'),
      createMockCard('card3', 'CardTypeC'),
    ];
    const errors = validateBentoLayout(mockBentoLayout, cards);
    expect(errors).toContainEqual({
      message: "Card at index 0 has type 'CardTypeB', but expected one of: CardTypeA.",
      type: 'error',
    });
  });

  it('should return error if a card is in an undefined position due to too many cards', () => {
    const cards: CardEntry[] = [
      createMockCard('card1', 'CardTypeA'),
      createMockCard('card2', 'CardTypeB'),
      createMockCard('card3', 'CardTypeB'),
      createMockCard('card4', 'CardTypeC'), // Extra card
    ];
     // Modify layout to expect 4 entries to isolate this specific test from totalEntries mismatch
    const layoutExpectingFour = {
        ...mockBentoLayout,
        limits: {...mockBentoLayout.limits, totalEntries: 4}
    };
    const errors = validateBentoLayout(layoutExpectingFour, cards);
    // This will also trigger "There are 4 cards, but only 3 positions are defined..."
    // And "Expected 4 cards, but found 4." (which is not an error)
    // The original test intent might be better covered by a layout with fewer position definitions
    // than totalEntries limit.

    // Let's adjust the test for clarity: layout defines fewer positions than cards provided,
    // even if totalEntries limit might accommodate them.
    const layoutWithFewerPositions: BentoLayout = {
        ...mockBentoLayout,
        positions: { // Only define 2 positions
            leftColumnFullHeightCard: { index: 0, expectedTypes: ['CardTypeA'] },
            rightColumnTopCard: { index: 1, expectedTypes: ['CardTypeB', 'CardTypeC'] },
        },
        limits: { // Still expects 3 cards overall
            totalEntries: 3,
            typeLimits: { CardTypeA: 1, CardTypeB: 2 }
        }
    };
    const threeCards: CardEntry[] = [
        createMockCard('card1', 'CardTypeA'),
        createMockCard('card2', 'CardTypeB'),
        createMockCard('card3', 'CardTypeB'), // This card has no defined position
    ];
    const errorsWithFewerPositions = validateBentoLayout(layoutWithFewerPositions, threeCards);
    expect(errorsWithFewerPositions).toContainEqual({
      message: 'Card at index 2 does not have a corresponding position rule in bentoLayout.',
      type: 'error',
    });
  });


  it('should return error if content type count exceeds limits.typeLimits', () => {
    const cards: CardEntry[] = [
      createMockCard('card1', 'CardTypeA'),
      createMockCard('card2', 'CardTypeA'), // Exceeds CardTypeA limit of 1
      createMockCard('card3', 'CardTypeB'),
    ];
    const errors = validateBentoLayout(mockBentoLayout, cards);
    expect(errors).toContainEqual({
      message: "Content type 'CardTypeA' exceeds its limit. Expected maximum 1, but found 2.",
      type: 'error',
    });
  });

  it('should handle cards array being shorter than defined positions', () => {
    const cards: CardEntry[] = [createMockCard('card1', 'CardTypeA')]; // Only 1 card
    const errors = validateBentoLayout(mockBentoLayout, cards);
    // It will primarily report the totalEntries mismatch
    expect(errors).toContainEqual({
      message: 'Expected 3 cards, but found 1.',
      type: 'error',
    });
    // It should also report that subsequent positions are effectively empty if we were to check that,
    // but current logic focuses on existing cards.
  });

  it('should return multiple errors if multiple rules are violated', () => {
    const cards: CardEntry[] = [
      createMockCard('card1', 'CardTypeC'), // Wrong type for pos 0
      createMockCard('card2', 'CardTypeA'), // Wrong type for pos 1
      // Missing card for pos 2 (violates totalEntries)
    ];
    const errors = validateBentoLayout(mockBentoLayout, cards);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ // Use expect.objectContaining for flexibility
          message: 'Expected 3 cards, but found 2.',
          type: 'error',
        }),
        expect.objectContaining({
          message: "Card at index 0 has type 'CardTypeC', but expected one of: CardTypeA.",
          type: 'error',
        }),
        expect.objectContaining({
          message: "Card at index 1 has type 'CardTypeA', but expected one of: CardTypeB, CardTypeC.",
          type: 'error',
        }),
      ])
    );
    expect(errors.length).toBe(3); // Ensure only expected errors are present
  });

  it('should return error if there are more cards than defined positions in layout', () => {
    const layoutWithLessPositions: BentoLayout = {
      ...mockBentoLayout,
      positions: {
        leftColumnFullHeightCard: { index: 0, expectedTypes: ['CardTypeA'] },
      },
      limits: { // Expects 2 cards, but only 1 position defined
        totalEntries: 2,
        typeLimits: { CardTypeA: 1, CardTypeB: 1 },
      },
    };
    const cards: CardEntry[] = [
      createMockCard('card1', 'CardTypeA'),
      createMockCard('card2', 'CardTypeB'), // This card has no position rule
    ];
    const errors = validateBentoLayout(layoutWithLessPositions, cards);
    expect(errors).toContainEqual({
      message: 'Card at index 1 does not have a corresponding position rule in bentoLayout.',
      type: 'error',
    });
  });

   it('should correctly validate type limits for types not present in cards', () => {
    const cards: CardEntry[] = [
      createMockCard('card1', 'CardTypeA'),
      createMockCard('card2', 'CardTypeB'),
      createMockCard('card3', 'CardTypeB'),
    ];
    // CardTypeC has a limit of 1, but 0 are present. This is valid.
    const errors = validateBentoLayout(mockBentoLayout, cards);
    expect(errors.some(e => e.message.includes('CardTypeC'))).toBe(false);
  });

  it('should return error if cards length exceeds positions length even if totalEntries matches', () => {
    const layoutWithFewerPositionsThanTotal: BentoLayout = {
      ...mockBentoLayout,
      positions: { // Only 2 positions defined
        leftColumnFullHeightCard: { index: 0, expectedTypes: ['CardTypeA'] },
        rightColumnTopCard: { index: 1, expectedTypes: ['CardTypeB'] },
      },
      limits: { // But totalEntries is 3
        totalEntries: 3,
        typeLimits: { CardTypeA: 1, CardTypeB: 2 },
      },
    };
    const cards: CardEntry[] = [
      createMockCard('card1', 'CardTypeA'),
      createMockCard('card2', 'CardTypeB'),
      createMockCard('card3', 'CardTypeB'), // This card has no defined position rule
    ];
    const errors = validateBentoLayout(layoutWithFewerPositionsThanTotal, cards);
    expect(errors).toContainEqual({
      message: 'Card at index 2 does not have a corresponding position rule in bentoLayout.',
      type: 'error',
    });
  });

});
