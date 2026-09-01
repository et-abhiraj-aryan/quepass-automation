Feature: Event face capture and search
  As an operator
  I want to capture and search attendee faces for an event
  So that attendees can be identified for that event

  Background:
    Given the QuePass workstation is ready for event operations

  Scenario: Capture an attendee face for an event
    When I open the event face capture module
    And I select the event "Multiple Registeration - remote"
    Then the attendee face is captured and searched

  Scenario: Search an attendee face for an event
    When I open the event face search module
    And I select the event "Multiple Registeration - remote"
    Then the attendee is found by event face search
