Feature: Express verification
  As an operator
  I want to verify a registrant quickly from a document number
  So that walk-ins can be processed without liveness prompts

  Background:
    Given the QuePass workstation is configured with liveness disabled

  Scenario: Verify a registrant by unified number
    When I start the express verification module
    And I select the document type "Unified Number (UN)"
    And I enter the document number "-4"
    Then the registrant is expressly verified
