Feature: Platform registration with passport and face
  As an operator
  I want to register a user by verifying their passport and their face
  So that they are signed up on the platform

  Background:
    Given the QuePass workstation is configured for platform verification

  Scenario: Register a user via passport scan and face verification
    When I start a platform registration
    And I start identity verification
    And I choose the "Passport International" document type
    And I scan the passport with the camera
    And I continue past the passport result
    And I capture the user's face
    And I continue past the face result
    And I submit the verification
    Then the user is signed up on the platform
