---
slug: /
---
The Etomica molecular modeling framework enables object-oriented molecular simulations to be constructed using classes written in Java. It has been under development since 1997. The framework is formed from more than 1000 such classes, enabling a wide variety of simulations to be constructed. Key capabilities include the following.

## Molecular Dynamics
- Velocity Verlet
- Collision-based
- Thermostats, barostats

## Monte Carlo
- Atom moves: molecule translation, rotation,...
- Ensembles: NVT, NVE, isobaric, grand-canonical, semigrand,...
- Biasing methods

## Potential-energy functions
- Soft: Lennard-Jones, Exp-6, Yukawa, WCA,...
- Hard: Spheres, square well, tether,...
- Electrostatics: Coulomb, point multipole, Ewald sum
- Multibody: MEAM, Axilrod-Teller, polarizable,...
- Intramolecular: Stretch, bending, torsion,...
- Various realistic molecular models (e.g., GCPM water)
- Hard or soft walls
- Energies, forces, torques, Hessian
- Neighbor listing

## Space and Boxes
- 3-, 2-, or 1-dimensional systems
- Single box for conventional simulations
- Multiple boxes for Gibbs ensemble, parallel tempering
- Period boundaries in all, some, or no coordinate directions
- Deformable boundaries

## Properties
- First- and second-derivative thermodynamic
- Transport coefficients
- Free energy
- Structure
- Uncertainty estimates for all calculations

## Mode of Operation
- GUI-based, for interactive exploration of behavior
- Batch, for reproducible, scripted production runs
- Inputs and outputs may be specified in arbitrary units
 
## Virial Coefficients
- Mayer-sampling Monte Carlo
- Wheatley recursion
- Temperature derivatives
- Multibody potentials
- Flexible correction
- Nuclear quantum effects: semiclassical or path integral



