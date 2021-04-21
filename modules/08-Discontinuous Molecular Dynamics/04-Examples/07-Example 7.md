

= The Periodic Boundary 3D SW (pbc3d) =

Elliott and Lira show that $Z = 1 + 4\eta g(\sigma)$ for hard spheres, where $g(\sigma)$ is the radial distribution function (rdf) at $r = \sigma$.  Evaluate the accuracy of this relationship for 3D HS fluids at a packing fraction equivalent to the $\rho = 2E-6 mol/m^2$ of the HD simulation and 300K.  

## Solution 
The rdf is illustrated on the RDF tab. (Surprise!)  The challenge of this problem then is to determine the proper unit conversions to obtain the targeted packing fractions. Note that the value of 2E-6 mol/m² is a 2D density. So we must first compute the packing fraction in 2D, then infer the 3D density that matches this packing fraction. 
 

Tinkering with the density slider, we find that 2E-6 mol/m² corresponds to 54 molecules. Referring to the Potential tab, we see that σ = 4$A^\circ $ = 0.4nm. In 2D, we have $V_{HD}=\pi \sigma^2/4$=0.1257nm² for the space occupied by one disk. The size of the simulation box can be inferred from the number of molecules and the density. 

54/{2E-6 mol*(602E21 disks/mol)/m²/(1E18nm²/m²)}=44.85nm² for the size of simulation box. 

So <i>η</i> = 54*0.1257/44.85 = 0.1513

  

To obtain <i>η</i> = 0.1513 in 3D, $\eta = b*\rho= \rho N_A\pi \sigma^3/6 $ where <i>b</i>=molecular volume (cm3/mol) 

<i>ρ</i>(mol/cm3) = 0.1513*6/(602E21*π*σ³) = 0.0075 mol/cm3 = 7.5 mol/L. 


Running for ~1 minute of clock time with 122 molecules (ie. 7.503mol/L) gives P=35.94±0.05MPa, indicating that Z=1.919±0.003.  Reading the rdf value from the graph shows that <i>g(σ)</i> = 1.45±0.05. Substituting gives, <i>Z</i>=1+4*0.1513*1.45=1.88±0.04.  Once again, the agreement is not perfect, but it is reasonable for such a short simulation and graphically reading the rdf.  If interested, you can compute the rdf for yourself by selecting the Show Configuration button on the Configuration tab.  You can also download the velocities to check on your ability to compute the next collision.  We leave those exercises for another day.




 ∞ ε  π  σ λ η β ε ρ ± ≡ ² ³ ≈