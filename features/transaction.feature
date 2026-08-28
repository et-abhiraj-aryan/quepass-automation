Feature: Transaction biometric verification
  As an operator
  I want to verify a registrant's identity before a transaction
  So that transactions are tied to the correct person

  Background:
    Given the QuePass workstation is configured

  Scenario: Verify a registrant for a transaction by face
    When I start the transaction module
    And I enter the verification ID "001-2003-00000002-0"
    And I continue to face verification
    Then the registrant is verified for the transaction
