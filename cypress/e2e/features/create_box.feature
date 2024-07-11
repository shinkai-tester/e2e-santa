Feature: Secret Santa E2E test

  Scenario: User creates box, invites users, and executes draw
    Given the user logs in with email "<email>" and password "<password>"
    When the user creates a box with the following details:
      | boxName   | minAmount   | maxAmount   | currency   |
      | <boxName> | <minAmount> | <maxAmount> | <currency> |
    Then the box "<boxName>" should be created successfully
    And the user gets an invite link
    And the invite link should be valid
    When the participants accept the invitation with the following details:
      | email               | password   | name    |
      | <participantEmail1> | <password> | <name1> |
      | <participantEmail2> | <password> | <name2> |
      | <participantEmail3> | <password> | <name3> |
    Then the user logs in with email "<email>" and password "<password>" and checks that the participants are added to the box:
      | name    |
      | <name1> |
      | <name2> |
      | <name3> |
    When the user initiates the draw
    Then the draw should be completed successfully
    And the box should be deleted

    Examples:
      | email                    | password | boxName  | minAmount | maxAmount | currency | participantEmail1          | participantPassword1 | name1   | participantEmail2          | participantPassword2 | name2   | participantEmail3          | participantPassword3 | name3   |
      | shinkai.tester@gmail.com | test1234 | testBox1 | 1         | 50        | Евро     | shinkai.tester+1@gmail.com | test1234             | shurka1 | shinkai.tester+2@gmail.com | test1234             | shurka2 | shinkai.tester+3@gmail.com | test1234             | shurka3 |
