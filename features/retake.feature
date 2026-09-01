Feature: Face-capture attempt limit
  As the security team
  I want the journey to block after the allowed face-capture attempts are used up
  So that endless liveness retries are not possible

  Background:
    Given the QuePass workstation is configured for platform verification

  @slow
  Scenario: The journey is blocked after the allowed face-capture attempts are exhausted
    When I start a platform registration
    And I start identity verification
    And I choose the "Passport International" document type
    And I scan the passport with the camera
    And I continue past the passport result
    And I retake the face capture until the journey is blocked
    Then the journey is blocked
