Feature: Anti-spoof regression - liveness must reject an injected camera stream
  As the security team
  I want an injected pre-recorded video to never pass liveness
  So that any regression that weakens the anti-spoof defense is caught automatically

  Background:
    Given the QuePass workstation is configured for platform verification

  Scenario: An injected face video must be rejected by liveness
    When I start a platform registration
    And I start identity verification
    And I choose the "Passport International" document type
    And I scan the passport with the camera
    And I continue past the passport result
    Then an injected face video "fixtures/media/ai_smile.mp4" must be rejected by liveness
