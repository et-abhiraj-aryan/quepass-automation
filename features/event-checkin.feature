Feature: Event check-in
  As an operator
  I want to check attendees into an event by face or QR code
  So that attendance is recorded at the door

  Background:
    Given the QuePass workstation is ready for event operations

  Scenario: Check in an attendee by face using a document
    When I open the event face check-in module
    And I select the event "Mulitple - Mumbai"
    And I select the document type "UID"
    And I enter the document number "001-2003-000000020"
    Then the attendee is checked in by biometric face

  Scenario: Check in an attendee by face at a kiosk
    When I open the event kiosk face check-in module
    And I select the event "Mulitple - Mumbai"
    Then the attendee is checked in by biometric face after the countdown

  Scenario: Check in an attendee by QR code
    When I open the event QR check-in module
    Then the attendee is checked in by QR when I select the event "Mulitple - Mumbai"

  Scenario: Check in an attendee by QR code at a kiosk
    When I open the event kiosk QR check-in module
    And I select the event "Mulitple - Mumbai"
    Then the attendee is checked in by QR after the countdown
