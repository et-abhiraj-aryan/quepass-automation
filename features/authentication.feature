Feature: Biometric authentication
  As an operator
  I want to authenticate a registrant with their document ID and face
  So that only verified people are granted access

  Background:
    Given the QuePass workstation is configured

  Scenario: Log in a registrant by biometric face verification
    When I start the authentication module
    And I enter the verification ID "001-2003-00000002-0"
    And I continue to face verification
    Then the registrant is verified by face login
