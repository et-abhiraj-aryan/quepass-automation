Feature: Event QR check-in with a registered pass
  As an operator
  I want to check an attendee in using the QR code from their registration
  So that the QR check-in path works end to end

  Background:
    Given the QuePass workstation is configured with liveness disabled

  @slow
  Scenario: Register an attendee, then check them in by QR
    When I start a new event registration
    And I select the event "Multiple Registeration - remote"
    And I select the ticket type "Standard"
    And I continue to face capture for registration
    And I download the registered pass
    And I return to the dashboard
    And I open the event QR check-in module
    Then the attendee is checked in by scanning the registered pass for event "Multiple Registeration - remote"

  @slow
  Scenario: Register an attendee, then check them in by QR at a kiosk
    When I start a new event registration
    And I select the event "Multiple Registeration - remote"
    And I select the ticket type "Standard"
    And I continue to face capture for registration
    And I download the registered pass
    And I return to the dashboard
    And I open the event kiosk QR check-in module
    Then the attendee is checked in by scanning the registered pass for event "Multiple Registeration - remote"
