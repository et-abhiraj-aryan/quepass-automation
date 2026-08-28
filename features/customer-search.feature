Feature: Customer search and face capture
  As an operator
  I want to find registrants by capturing their face
  So that I can look up a customer without a document

  Scenario: Search for a customer by face from the dashboard
    Given the QuePass workstation is configured
    When I start the customer search module
    Then the customer is found by face search

  Scenario: Capture a face from the face capture module
    Given the QuePass workstation is configured
    When I start the face capture module
    Then the captured face is searched

  Scenario: Search by face from the kiosk
    Given the QuePass workstation is configured with liveness disabled
    Then a customer is found via the kiosk face search
