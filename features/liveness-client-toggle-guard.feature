Feature: Server-side liveness must not be disabled by a client toggle
  As the security team
  I want an injected face to stay rejected even when Passive Liveness is unchecked
  So that a client-side setting cannot switch off the server-side liveness check

  @slow
  Scenario: An injected face video is rejected even with passive liveness unchecked
    Given the QuePass workstation is configured for platform verification with passive liveness disabled
    When I start a platform registration
    And I start identity verification
    And I choose the "Passport International" document type
    And I scan the passport with the camera
    And I continue past the passport result
    Then an injected face video "fixtures/media/new_normal_video.mp4" must be rejected by liveness within 60 seconds
