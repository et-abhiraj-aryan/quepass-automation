Feature: Liveness robustness - video recompression (AI face)
  As a security tester
  I want to feed the same AI smile clip at progressively heavier H.264 compression
  So that I can find the compression boundary where liveness starts rejecting it

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
      | label     | path                                       |
      | baseline  | fixtures/media/ai_smile.mp4                |
      | crf28     | fixtures/media/experiments/vid_crf28.mp4   |
      | crf35     | fixtures/media/experiments/vid_crf35.mp4   |
      | crf42     | fixtures/media/experiments/vid_crf42.mp4   |
      | crf48     | fixtures/media/experiments/vid_crf48.mp4   |
      | crf51     | fixtures/media/experiments/vid_crf51.mp4   |
