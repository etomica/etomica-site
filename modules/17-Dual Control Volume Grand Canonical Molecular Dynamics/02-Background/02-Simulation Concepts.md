

*Modeling Techniques*

The dual control volume grand canonical molecular dynamics simulation (DCV-GCMD) method is a bridge between molecular dynamics (MD) and grand canonical Monte Carlo (GCMC) atomistic computer simulations.  The dual control volume (DCV) allows the system to operate within the grand canonical ensemble (constant temperature, volume, and chemical potential), where Monte Carlo (MC) insertions and deletions effectively control the chemical potential.  This spatial restraint of the chemical potential within the control volumes enables the MD simulation to function at steady state which is essential for diffusion to be modeled.  In the presence of a steady state chemical potential gradient DCV-GCMD enables a direct measurement of the species diffusivity via Fick's law.

*Simulation Methods*

Both components in the simulation are modeled as Weeks, Chandler, and Anderson fluids (WCA).  Essentially this fluid interacts with a truncated and displaced Lennard-Jones potential.  The components throughout the simulation volume model argon and only differ in their color.  The blue represents the species with the lower chemical potential.

Periodic boundary conditions apply in both the x and y directions, with impassable walls (nonperiodic) at each end of the simulation volume.  The same WCA potentials were also used to define the molecular interactions with the walls as a function of the molecules z-component distance from the wall.


The simulation volume has dimensions in angstroms of 40X40X80 in the x, y, and z respectively, with the origin of the volume of the volume defined at the "left, front, bottom" of the simulation.  The chemical potential is controlled by insertions and deletions within the first 10%, and last 10% of the total simulation volume. 50 insertions and deletions were attempted within a control volume for every molecular dynamics step.

The flux was measured by measuring the insertions and deletion of particles.  Once a steady state was achieved, if a molecule on one side was added, it would be deleted from the other side.