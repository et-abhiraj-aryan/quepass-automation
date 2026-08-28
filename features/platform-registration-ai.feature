Feature: Platform registration with an AI-generated face (liveness spoof test)
  As a security tester
  I want to attempt platform registration using an AI-generated face video
  So that I can confirm whether the SDK's liveness detection accepts or rejects it

  Background:
    Given the QuePass workstation is configured for platform verification

  Scenario: Attempt registration with an AI-generated face video
    When I start a platform registration
    And I start identity verification
    And I choose the "Passport International" document type
    And I scan the passport with the camera
    And I continue past the passport result
    And I capture the user's face with the AI-generated video
    And I continue past the face result
    And I submit the verification
    Then the user is signed up on the platform
