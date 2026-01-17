/// <reference types="cypress" />

describe("Landing Hero", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    describe("Visual Rendering", () => {
        it("should display headline and CTA", () => {
            cy.contains("Build momentum").should("be.visible");
            cy.contains("Keep the streak").should("be.visible");
            cy.contains("Start my streak — Free").should("be.visible");
        });

        it("should display interactive calendar preview", () => {
            cy.contains("January 2026").should("be.visible");
            cy.contains("Interactive Preview").should("be.visible");
        });

        it("should show navigation with login and signup", () => {
            cy.contains("Log in").should("be.visible");
            cy.contains("Sign up free").should("be.visible");
        });
    });

    describe("Calendar Interactions", () => {
        it("should show tooltip on date hover", () => {
            // Hover over a calendar cell
            cy.get('[role="gridcell"]').first().trigger("mouseenter");
            cy.get('[role="tooltip"]').should("be.visible");
        });

        it("should open quick panel on date click", () => {
            cy.get('[role="gridcell"]').first().click();
            cy.get('[role="dialog"]').should("be.visible");
            cy.contains("Demo Mode").should("be.visible");
        });

        it("should close panel with escape key", () => {
            cy.get('[role="gridcell"]').first().click();
            cy.get('[role="dialog"]').should("be.visible");
            cy.get("body").type("{esc}");
            cy.get('[role="dialog"]').should("not.exist");
        });

        it("should close panel with close button", () => {
            cy.get('[role="gridcell"]').first().click();
            cy.get('[aria-label="Close panel"]').click();
            cy.get('[role="dialog"]').should("not.exist");
        });
    });

    describe("Habit Simulation", () => {
        it("should toggle habit completion in demo", () => {
            cy.get('[role="gridcell"]').first().click();

            // Click first habit
            cy.get('[role="dialog"]').within(() => {
                cy.get('button[aria-pressed="false"]').first().click();
                cy.get('button[aria-pressed="true"]').should("have.length.at.least", 1);
            });
        });

        it("should update progress bar on completion", () => {
            cy.get('[role="gridcell"]').first().click();

            // Complete all habits
            cy.get('[role="dialog"]').within(() => {
                cy.get('button[aria-pressed="false"]').each(($btn) => {
                    cy.wrap($btn).click();
                });

                // Progress should be full
                cy.contains("Perfect day — nice work").should("be.visible");
            });
        });
    });

    describe("CTA Flow", () => {
        it("should navigate to register on primary CTA click", () => {
            cy.contains("Start my streak — Free").click();
            cy.url().should("include", "/register");
        });

        it("should scroll to demo section on secondary CTA click", () => {
            cy.contains("See it in 30s").click();
            cy.get("#demo-section").should("be.visible");
        });
    });

    describe("Accessibility", () => {
        it("should be keyboard navigable", () => {
            // Tab to CTA
            cy.get("body").tab();
            cy.focused().should("contain.text", "Log in");

            cy.focused().tab();
            cy.focused().should("contain.text", "Sign up");
        });

        it("should have proper ARIA labels", () => {
            cy.get('[role="gridcell"]').each(($cell) => {
                expect($cell).to.have.attr("aria-label");
            });
        });

        it("should trap focus in modal", () => {
            cy.get('[role="gridcell"]').first().click();

            // Focus should be trapped in dialog
            cy.get('[role="dialog"]').should("be.visible");
            cy.focused().closest('[role="dialog"]').should("exist");
        });
    });

    describe("Reduced Motion", () => {
        it("should respect prefers-reduced-motion", () => {
            // This test needs to be run with reduced motion emulation
            // In Cypress config, set: "env": { "reducedMotion": true }
            cy.log("Manual test: Verify animations are disabled with prefers-reduced-motion");
        });
    });
});

describe("Analytics Events", () => {
    beforeEach(() => {
        cy.visit("/");

        // Stub analytics
        cy.window().then((win) => {
            win.gtag = cy.stub().as("gtag");
        });
    });

    it("should fire hero_cta_click on primary CTA", () => {
        cy.contains("Start my streak — Free").click({ force: true });
        cy.get("@gtag").should("have.been.calledWith", "event", "hero_cta_click");
    });

    it("should fire preview_hover_date on calendar hover", () => {
        cy.get('[role="gridcell"]').first().trigger("mouseenter");
        cy.get("@gtag").should("have.been.calledWith", "event", "preview_hover_date");
    });

    it("should fire preview_simulate_complete on habit toggle", () => {
        cy.get('[role="gridcell"]').first().click();
        cy.get('[role="dialog"]').within(() => {
            cy.get('button[aria-pressed="false"]').first().click();
        });
        cy.get("@gtag").should("have.been.calledWith", "event", "preview_simulate_complete");
    });
});
