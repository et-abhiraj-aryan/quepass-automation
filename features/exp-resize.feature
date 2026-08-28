Feature: Liveness robustness - video resize and upscale (AI face)
  As a security tester
  I want to downscale then upscale the AI smile clip back to normal size
  So that I can see how much resolution loss liveness tolerates before rejecting

  Background:
    Given the QuePass workstation is configured for platform verification

  Scenario Outline: Register with a <label> AI face clip
    When I start a platform registration
    And I start identity verification
    And I choose the "Passport International" document type
    And I scan the passport with the camera
    And I continue past the passport result
    And I capture the user's face from the video "<path>"
    And I continue past the face result
    And I submit the verification
    Then the user is signed up on the platform

    Examples:
      | label          | path                                      |
      | downscaled-360 | fixtures/media/experiments/vres_360.mp4   |
      | downscaled-180 | fixtures/media/experiments/vres_180.mp4   |
      | downscaled-90  | fixtures/media/experiments/vres_90.mp4    |
