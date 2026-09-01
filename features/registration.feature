Feature: Event registration
  As an operator
  I want to register an attendee for an event and issue their pass
  So that they can enter using the generated pass

  Background:
    Given the QuePass workstation is configured with liveness disabled

  Scenario: Register an attendee and download their pass
    When I start a new event registration
    And I select the event "Multiple Registeration - remote"
    And I select the ticket type "Standard"
    And I continue to face capture for registration
    Then the attendee pass is downloaded
