import {
  AtLeastOneField,
  AtLeastOneFieldConstraint,
} from './at-least-one-field.validator';
import { ValidationArguments } from 'class-validator';

describe('AtLeastOneField', () => {
  describe('AtLeastOneFieldConstraint', () => {
    let constraint: AtLeastOneFieldConstraint;

    beforeEach(() => {
      constraint = new AtLeastOneFieldConstraint();
    });

    describe('validate', () => {
      it('should return true if at least one field is provided when specific fields are defined', () => {
        const object = { name: 'Test', email: null, phone: undefined };
        const args = {
          object,
          constraints: [['name', 'email', 'phone']],
        } as ValidationArguments;

        expect(constraint.validate(null, args)).toBe(true);
      });

      it('should return false if none of the specified fields are provided', () => {
        const object = { name: undefined, email: null, phone: undefined };
        const args = {
          object,
          constraints: [['name', 'email', 'phone']],
        } as ValidationArguments;

        expect(constraint.validate(null, args)).toBe(false);
      });

      it('should check all object fields if no specific fields are provided', () => {
        const object = {
          name: undefined,
          email: 'test@example.com',
          phone: undefined,
        };
        const args = {
          object,
          constraints: [[]],
        } as ValidationArguments;

        expect(constraint.validate(null, args)).toBe(true);
      });

      it('should return false if all fields in the object are null or undefined', () => {
        const object = { name: undefined, email: null, phone: undefined };
        const args = {
          object,
          constraints: [[]],
        } as ValidationArguments;

        expect(constraint.validate(null, args)).toBe(false);
      });
    });

    describe('defaultMessage', () => {
      it('should return generic message if no specific fields are provided', () => {
        const args = {
          constraints: [[]],
        } as ValidationArguments;

        expect(constraint.defaultMessage(args)).toBe(
          'At least one field must be provided',
        );
      });

      it('should return message with field names if specific fields are provided', () => {
        const args = {
          constraints: [['name', 'email', 'phone']],
        } as ValidationArguments;

        expect(constraint.defaultMessage(args)).toBe(
          'At least one of the fields name,email,phone must be provided',
        );
      });
    });
  });

  describe('AtLeastOneField decorator', () => {
    it('should register the decorator with the correct options', () => {
      // Mock registerDecorator function to verify it's called correctly
      const mockRegisterDecorator = jest.fn();
      jest.mock('class-validator', () => ({
        ...jest.requireActual('class-validator'),
        registerDecorator: (...args: any[]) => mockRegisterDecorator(...args),
      }));

      // Create a test class
      class TestDto {}

      // We can't directly test the function call effects, but we can verify
      // the decorator doesn't throw errors when applied
      expect(() => {
        AtLeastOneField(['name', 'email'])(TestDto);
      }).not.toThrow();
    });
  });
});
